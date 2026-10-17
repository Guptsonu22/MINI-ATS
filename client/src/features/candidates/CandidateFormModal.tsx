import React, { useState, useEffect } from 'react';
import { Candidate, CanonicalStage } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { MOCK_ROLES, MOCK_SOURCES } from '../../data/mockCandidates';

interface CandidateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidateData: Partial<Candidate>) => void;
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
    currentStage: 'Applied' as CanonicalStage,
    resumeUrl: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    }
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const skills = formData.skillsString
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    onSubmit({
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
  };

  const stageOptions = [
    { label: 'Applied', value: 'Applied' },
    { label: 'Screening', value: 'Screening' },
    { label: 'Interview', value: 'Interview' },
    { label: 'Offer', value: 'Offer' },
    { label: 'Hired', value: 'Hired' },
    { label: 'Rejected', value: 'Rejected' },
  ];

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
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Candidate'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. John Doe"
            error={errors.name}
          />

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
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
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
            onChange={e => setFormData({ ...formData, experience: Number(e.target.value) })}
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
            onChange={e =>
              setFormData({ ...formData, currentStage: e.target.value as CanonicalStage })
            }
          />
        </div>

        {/* Skills */}
        <Input
          label="Key Skills"
          required
          value={formData.skillsString}
          onChange={e => setFormData({ ...formData, skillsString: e.target.value })}
          placeholder="e.g. React, TypeScript, Node.js, Tailwind CSS"
          helperText="Enter skills separated by commas"
          error={errors.skillsString}
        />

        {/* Resume URL */}
        <Input
          label="Resume Link (Optional)"
          type="url"
          value={formData.resumeUrl}
          onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
          placeholder="https://example.com/resumes/candidate.pdf"
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
