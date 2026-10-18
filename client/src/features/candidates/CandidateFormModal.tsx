import React, { useState, useEffect } from 'react';
import { Candidate, CanonicalStage } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { MOCK_ROLES, MOCK_SOURCES } from '../../data/mockCandidates';
import { AlertCircle } from 'lucide-react';

interface CandidateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidateData: Partial<Candidate>) => Promise<void> | void;
  initialData?: Candidate | null;
  isLoading?: boolean;
}

export const CandidateFormModal: React.FC<CandidateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    appliedRole: string;
    experience: number;
    source: string;
    skillsString: string;
    currentStage: CanonicalStage;
    resumeUrl: string;
    notes: string;
  }>({
    name: '',
    email: '',
    phone: '',
    appliedRole: MOCK_ROLES[0],
    experience: 2,
    source: MOCK_SOURCES[0],
    skillsString: '',
    currentStage: 'Applied',
    resumeUrl: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        appliedRole: initialData.appliedRole,
        experience: initialData.experience,
        source: initialData.source,
        skillsString: initialData.skills.join(', '),
        currentStage: initialData.currentStage,
        resumeUrl: initialData.resumeUrl || '',
        notes: initialData.notes || '',
      });
      setErrors({});
      setServerError(null);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        appliedRole: MOCK_ROLES[0],
        experience: 2,
        source: MOCK_SOURCES[0],
        skillsString: '',
        currentStage: 'Applied',
        resumeUrl: '',
        notes: '',
      });
      setErrors({});
      setServerError(null);
    }
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.experience < 0 || formData.experience > 50) {
      newErrors.experience = 'Experience must be between 0 and 50 years';
    }

    if (!formData.skillsString.trim()) {
      newErrors.skillsString = 'Please enter at least one skill';
    }

    if (formData.resumeUrl && formData.resumeUrl.trim()) {
      try {
        new URL(formData.resumeUrl.trim());
      } catch {
        newErrors.resumeUrl = 'Please provide a valid URL (e.g. https://example.com/resume.pdf)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate() || isSubmitting || isLoading) return;

    const skills = formData.skillsString
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        appliedRole: formData.appliedRole,
        experience: Number(formData.experience),
        source: formData.source,
        skills,
        currentStage: formData.currentStage,
        resumeUrl: formData.resumeUrl.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'An error occurred while saving the candidate.';
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
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

  const disableActions = isSubmitting || isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Candidate Details' : 'Add New Candidate'}
      subtitle={
        isEditing
          ? 'Update recruitment information for this applicant.'
          : 'Create a candidate profile in the recruitment pipeline.'
      }
      maxWidth="xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={disableActions}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={disableActions}
            disabled={disableActions}
          >
            {isEditing ? 'Save Changes' : 'Create Candidate'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={e => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="e.g. John Doe"
            error={errors.name}
          />

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={e => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="e.g. john.doe@example.com"
            error={errors.email}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <Input
            label="Phone Number"
            required
            value={formData.phone}
            onChange={e => {
              setFormData({ ...formData, phone: e.target.value });
              if (errors.phone) setErrors({ ...errors, phone: '' });
            }}
            placeholder="e.g. +91 98765 43210"
            error={errors.phone}
          />

          {/* Applied Role */}
          <Select
            label="Applied Role"
            required
            options={MOCK_ROLES.map(r => ({ label: r, value: r }))}
            value={formData.appliedRole}
            onChange={e => setFormData({ ...formData, appliedRole: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Experience */}
          <Input
            label="Experience (Years)"
            type="number"
            min={0}
            max={50}
            required
            value={formData.experience}
            onChange={e => {
              setFormData({ ...formData, experience: Number(e.target.value) });
              if (errors.experience) setErrors({ ...errors, experience: '' });
            }}
            error={errors.experience}
          />

          {/* Source */}
          <Select
            label="Candidate Source"
            required
            options={MOCK_SOURCES.map(s => ({ label: s, value: s }))}
            value={formData.source}
            onChange={e => setFormData({ ...formData, source: e.target.value })}
          />

          {/* Initial Stage */}
          <Select
            label="Hiring Stage"
            required
            options={stageOptions}
            value={formData.currentStage}
            onChange={e => setFormData({ ...formData, currentStage: e.target.value as CanonicalStage })}
          />
        </div>

        {/* Skills */}
        <Input
          label="Key Skills"
          required
          value={formData.skillsString}
          onChange={e => {
            setFormData({ ...formData, skillsString: e.target.value });
            if (errors.skillsString) setErrors({ ...errors, skillsString: '' });
          }}
          placeholder="e.g. React, TypeScript, Node.js, Tailwind CSS"
          helperText="Enter skills separated by commas"
          error={errors.skillsString}
        />

        {/* Resume URL */}
        <Input
          label="Resume Link (Optional)"
          type="url"
          value={formData.resumeUrl}
          onChange={e => {
            setFormData({ ...formData, resumeUrl: e.target.value });
            if (errors.resumeUrl) setErrors({ ...errors, resumeUrl: '' });
          }}
          placeholder="https://example.com/resumes/candidate.pdf"
          error={errors.resumeUrl}
        />

        {/* Notes */}
        <Textarea
          label="Recruiter Notes (Optional)"
          rows={3}
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Initial recruiter feedback, portfolio remarks, or interview notes..."
        />
      </form>
    </Modal>
  );
};
