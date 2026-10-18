import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CanonicalStage, Candidate } from '../types';
import { ArrowLeft, Plus, ExternalLink, Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { CandidateFormModal } from '../features/candidates/CandidateFormModal';
import { candidatesApi } from '../api/candidates.api';
import { useToast } from '../context/ToastContext';

export const PipelinePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const stages: Array<{
    id: CanonicalStage;
    label: string;
    headerBg: string;
    border: string;
    dot: string;
  }> = [
    {
      id: 'Applied',
      label: 'Applied',
      headerBg: 'bg-slate-100 text-slate-800',
      border: 'border-slate-300',
      dot: 'bg-slate-400',
    },
    {
      id: 'Screening',
      label: 'Screening',
      headerBg: 'bg-purple-100 text-purple-800',
      border: 'border-purple-300',
      dot: 'bg-purple-500',
    },
    {
      id: 'Interview',
      label: 'Interview',
      headerBg: 'bg-blue-100 text-blue-800',
      border: 'border-blue-300',
      dot: 'bg-blue-500',
    },
    {
      id: 'Offer',
      label: 'Offer',
      headerBg: 'bg-amber-100 text-amber-800',
      border: 'border-amber-300',
      dot: 'bg-amber-500',
    },
    {
      id: 'Hired',
      label: 'Hired',
      headerBg: 'bg-emerald-100 text-emerald-800',
      border: 'border-emerald-300',
      dot: 'bg-emerald-500',
    },
    {
      id: 'Rejected',
      label: 'Rejected',
      headerBg: 'bg-rose-100 text-rose-800',
      border: 'border-rose-300',
      dot: 'bg-rose-500',
    },
  ];

  const fetchPipelineCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await candidatesApi.getCandidates({ limit: 100 });
      setCandidates(response.candidates);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the ATS API server. Please check your network connection.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelineCandidates();
  }, [fetchPipelineCandidates]);

  const handleAddCandidate = async (candData: Partial<Candidate>) => {
    try {
      await candidatesApi.createCandidate({
        name: candData.name!,
        email: candData.email!,
        phone: candData.phone!,
        appliedRole: candData.appliedRole!,
        experience: candData.experience!,
        source: candData.source!,
        skills: candData.skills || [],
        currentStage: candData.currentStage || 'Applied',
        resumeUrl: candData.resumeUrl,
        notes: candData.notes,
      });

      addToast(`Candidate ${candData.name} registered into pipeline`, 'success');
      setIsAddModalOpen(false);
      await fetchPipelineCandidates();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register candidate';
      addToast(msg, 'error');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Hiring Pipeline Board
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual recruitment pipeline across canonical stages.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Candidate
        </Button>
      </div>

      {/* Error Banner */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center space-y-3">
          <div className="flex justify-center text-rose-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-rose-900">Unable to Load Pipeline Data</h3>
          <p className="text-xs sm:text-sm text-rose-700 max-w-md mx-auto">{error}</p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={fetchPipelineCandidates}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* Kanban Board Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {stages.map(stage => {
          const stageCandidates = candidates.filter(c => c.currentStage === stage.id);

          return (
            <div
              key={stage.id}
              className="w-80 flex-shrink-0 flex flex-col rounded-2xl border border-slate-200 bg-slate-100/70 p-3 shadow-xs min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                  <span className="font-bold text-sm text-slate-800">{stage.label}</span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-2xs border border-slate-200">
                  {isLoading ? '...' : stageCandidates.length}
                </span>
              </div>

              {/* Loading Skeleton */}
              {isLoading ? (
                <div className="space-y-2.5 flex-1">
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ) : (
                /* Candidate Cards Column */
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {stageCandidates.length === 0 ? (
                    <div className="h-32 flex items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                      No candidates in this stage
                    </div>
                  ) : (
                    stageCandidates.map(cand => {
                      const formattedDate = new Date(cand.applicationDate).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      );

                      return (
                        <div
                          key={cand.id}
                          onClick={() => navigate(`/candidates/${cand.id}`)}
                          className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer group space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                              {cand.name}
                            </h4>
                            <span className="text-[10px] rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                              {cand.experience}y exp
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 font-medium">{cand.appliedRole}</p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {cand.skills.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className="text-[10px] rounded bg-slate-50 px-1.5 py-0.5 text-slate-500 border border-slate-150"
                              >
                                {skill}
                              </span>
                            ))}
                            {cand.skills.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{cand.skills.length - 3}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formattedDate}
                            </span>
                            <span className="group-hover:text-brand-600 flex items-center gap-0.5 font-medium">
                              Details <ExternalLink className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Candidate Modal */}
      <CandidateFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCandidate}
      />
    </div>
  );
};
