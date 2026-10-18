import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  GitPullRequest,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Candidate, CanonicalStage } from '../types';
import { StageBadge } from '../features/candidates/StageBadge';
import { StageHistoryTimeline } from '../features/candidates/StageHistoryTimeline';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CandidateFormModal } from '../features/candidates/CandidateFormModal';
import { Skeleton } from '../components/ui/Skeleton';
import { candidatesApi } from '../api/candidates.api';
import { useToast } from '../context/ToastContext';

export const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isChangeStageOpen, setIsChangeStageOpen] = useState(false);
  const [newStage, setNewStage] = useState<CanonicalStage>('Applied');
  const [stageNote, setStageNote] = useState('');
  const [isSubmittingStage, setIsSubmittingStage] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCandidate = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await candidatesApi.getCandidateById(id);
      setCandidate(data);
      setNewStage(data.currentStage);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to retrieve candidate information. The record may not exist or the server could not be reached.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  const handleStageChangeSubmit = async () => {
    if (!candidate || !id) return;
    if (newStage === candidate.currentStage) {
      setIsChangeStageOpen(false);
      return;
    }

    setIsSubmittingStage(true);
    try {
      const updated = await candidatesApi.updateCandidateStage(id, {
        stage: newStage,
        note: stageNote.trim() || undefined,
        changedBy: 'Recruiter',
      });

      setCandidate(updated);
      setIsChangeStageOpen(false);
      setStageNote('');
      addToast(`Candidate moved to ${newStage} stage`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update hiring stage';
      addToast(msg, 'error');
    } finally {
      setIsSubmittingStage(false);
    }
  };

  const handleEditCandidate = async (updatedFields: Partial<Candidate>) => {
    if (!candidate || !id) return;

    try {
      const updated = await candidatesApi.updateCandidate(id, {
        name: updatedFields.name,
        email: updatedFields.email,
        phone: updatedFields.phone,
        appliedRole: updatedFields.appliedRole,
        experience: updatedFields.experience,
        source: updatedFields.source,
        skills: updatedFields.skills,
        currentStage: updatedFields.currentStage,
        resumeUrl: updatedFields.resumeUrl,
        notes: updatedFields.notes,
      });

      setCandidate(updated);
      setIsEditModalOpen(false);
      addToast('Candidate details updated successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update candidate details';
      addToast(msg, 'error');
      throw err;
    }
  };

  const handleDeleteCandidate = async () => {
    if (!candidate || !id) return;

    setIsDeleting(true);
    try {
      await candidatesApi.deleteCandidate(id);
      addToast(`Candidate ${candidate.name} has been deleted`, 'success');
      setIsDeleteDialogOpen(false);
      navigate('/candidates');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete candidate';
      addToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const stageOptions = [
    { label: 'Applied', value: 'Applied' },
    { label: 'Screening', value: 'Screening' },
    { label: 'Interview', value: 'Interview' },
    { label: 'Offer', value: 'Offer' },
    { label: 'Hired', value: 'Hired' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !candidate) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-12 text-center space-y-4 shadow-sm">
        <div className="flex justify-center text-rose-500">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Candidate Record Not Found</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {error || 'The requested applicant record could not be found or retrieved from the database.'}
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCandidate}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Retry Request
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/candidates')}>
            Back to Candidate Directory
          </Button>
        </div>
      </div>
    );
  }

  const initials = candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = new Date(candidate.applicationDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Back button & Action Toolbar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/candidates')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Candidate Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="h-3.5 w-3.5" />}
          >
            Edit Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setNewStage(candidate.currentStage);
              setIsChangeStageOpen(true);
            }}
            leftIcon={<GitPullRequest className="h-3.5 w-3.5" />}
          >
            Update Stage
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Candidate Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 font-bold text-xl border border-brand-200 flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {candidate.name}
                </h1>
                <StageBadge stage={candidate.currentStage} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  {candidate.appliedRole}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Applied {formattedDate}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  {candidate.experience} {candidate.experience === 1 ? 'Year' : 'Years'} Exp
                </span>
              </div>
            </div>
          </div>

          {candidate.resumeUrl && (
            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <span>View Resume PDF</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </a>
          )}
        </div>

        {/* Contact details row */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block mb-1">Email Address</span>
            <a
              href={`mailto:${candidate.email}`}
              className="text-slate-800 font-semibold hover:text-brand-600 flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{candidate.email}</span>
            </a>
          </div>

          <div>
            <span className="text-slate-400 font-medium block mb-1">Phone Number</span>
            <a
              href={`tel:${candidate.phone}`}
              className="text-slate-800 font-semibold hover:text-brand-600 flex items-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{candidate.phone}</span>
            </a>
          </div>

          <div>
            <span className="text-slate-400 font-medium block mb-1">Application Source</span>
            <span className="text-slate-800 font-semibold">{candidate.source}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Stage History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skills & Notes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Skills Tag Cloud */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Technical Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Recruiter Notes</h3>
            {candidate.notes ? (
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                {candidate.notes}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No notes recorded for this candidate.</p>
            )}
          </div>
        </div>

        {/* Right Column: Stage Change History Timeline */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Hiring Pipeline History</h3>
              <p className="text-xs text-slate-500">
                Audit trail of recruitment stage changes and milestone notes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewStage(candidate.currentStage);
                setIsChangeStageOpen(true);
              }}
              leftIcon={<Sparkles className="h-3.5 w-3.5 text-brand-600" />}
            >
              Change Stage
            </Button>
          </div>

          <StageHistoryTimeline history={candidate.stageHistory} />
        </div>
      </div>

      {/* Change Stage Modal */}
      <Modal
        isOpen={isChangeStageOpen}
        onClose={() => setIsChangeStageOpen(false)}
        title="Promote Candidate Stage"
        subtitle={`Update hiring stage for ${candidate.name}`}
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangeStageOpen(false)}
              disabled={isSubmittingStage}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleStageChangeSubmit}
              isLoading={isSubmittingStage}
              disabled={isSubmittingStage}
            >
              Confirm Transition
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Target Stage"
            options={stageOptions}
            value={newStage}
            onChange={e => setNewStage(e.target.value as CanonicalStage)}
            disabled={isSubmittingStage}
          />

          <Textarea
            label="Transition Reason / Recruiter Feedback"
            placeholder="e.g. Cleared technical interview round with high scores. Advancing to offer review."
            rows={3}
            value={stageNote}
            onChange={e => setStageNote(e.target.value)}
            disabled={isSubmittingStage}
          />
        </div>
      </Modal>

      {/* Edit Candidate Modal */}
      <CandidateFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditCandidate}
        initialData={candidate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCandidate}
        title="Delete Candidate Record"
        message={`Are you sure you want to permanently delete ${candidate.name}? This candidate will be removed from all pipeline stages.`}
        confirmText="Delete Candidate"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
