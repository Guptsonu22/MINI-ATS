import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../src/context/ToastContext';
import { CandidateDetailPage } from '../src/pages/CandidateDetailPage';
import { CandidateFormModal } from '../src/features/candidates/CandidateFormModal';
import { ConfirmDialog } from '../src/components/ui/ConfirmDialog';
import { Candidate } from '../src/types';

const sampleCandidate: Candidate = {
  id: 'cand-777',
  name: 'Marcus Brody',
  email: 'marcus.b@example.com',
  phone: '+1 555-0177',
  appliedRole: 'Staff Frontend Engineer',
  experience: 7,
  source: 'Referral',
  skills: ['React', 'TypeScript', 'Tailwind', 'GraphQL'],
  currentStage: 'Applied',
  applicationDate: '2026-10-15T09:00:00.000Z',
  stageHistory: [
    {
      fromStage: null,
      toStage: 'Applied',
      changedAt: '2026-10-15T09:00:00.000Z',
      note: 'Referred by engineering director',
    },
  ],
};

describe('Phase 6: Frontend Accessibility, Keyboard & Workflow Reliability', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  describe('Accessible Form Labels & Validation Attributes', () => {
    it('associates all form inputs with accessible labels and attributes', () => {
      render(
        <CandidateFormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
        />
      );

      // Verify accessible form controls
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/experience/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/skills/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hiring stage/i)).toBeInTheDocument();
    });

    it('attaches aria-invalid and aria-describedby with role=alert on validation failure', async () => {
      render(
        <CandidateFormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
        />
      );

      // Click submit with empty form to trigger client-side validation
      const submitBtn = screen.getByRole('button', { name: /create candidate/i });
      fireEvent.click(submitBtn);

      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby', 'full-name-error');

      const nameError = screen.getByText('Full name is required');
      expect(nameError).toHaveAttribute('id', 'full-name-error');
      expect(nameError).toHaveAttribute('role', 'alert');

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-address-error');

      const emailError = screen.getByText('Email address is required');
      expect(emailError).toHaveAttribute('id', 'email-address-error');
      expect(emailError).toHaveAttribute('role', 'alert');
    });

    it('prevents duplicate submissions by disabling the submit button while pending', async () => {
      let resolveSubmit: () => void = () => {};
      const slowSubmit = vi.fn().mockImplementation(() => {
        return new Promise<void>(res => {
          resolveSubmit = res;
        });
      });

      render(
        <CandidateFormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={slowSubmit}
          initialData={sampleCandidate}
        />
      );

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      expect(saveBtn).not.toBeDisabled();

      // Submit once
      fireEvent.click(saveBtn);

      // Immediately verify button is disabled and submission cannot be called again
      expect(saveBtn).toBeDisabled();
      expect(slowSubmit).toHaveBeenCalledTimes(1);

      // Double-click attempt while in-flight
      fireEvent.click(saveBtn);
      expect(slowSubmit).toHaveBeenCalledTimes(1);

      // Resolve async submission
      resolveSubmit();
    });
  });

  describe('Keyboard Navigation & Modal Dismissal', () => {
    it('closes CandidateFormModal when the Escape key is pressed', () => {
      const handleClose = vi.fn();
      render(
        <CandidateFormModal
          isOpen={true}
          onClose={handleClose}
          onSubmit={() => {}}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes ConfirmDialog when the Escape key is pressed', () => {
      const handleClose = vi.fn();
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={() => {}}
          title="Delete Candidate"
          message="Are you sure you want to delete this record?"
        />
      );

      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('cancels deletion without dispatching API request when Cancel is clicked', () => {
      const handleClose = vi.fn();
      const handleConfirm = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Delete Candidate Record"
          message="This action permanently removes the candidate."
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelBtn);

      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(handleConfirm).not.toHaveBeenCalled();
    });
  });

  describe('End-to-End Workflow Resilience', () => {
    it('handles deep navigation to missing candidate record and allows returning to directory', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: { message: 'Candidate not found', code: 'CANDIDATE_NOT_FOUND' },
        }),
      });

      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/candidates/non-existent-id']}>
            <Routes>
              <Route path="/candidates/:id" element={<CandidateDetailPage />} />
              <Route path="/candidates" element={<div>Candidate Directory Root</div>} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Candidate Record Not Found')).toBeInTheDocument();
      });

      const backBtn = screen.getByRole('button', { name: /back to candidate directory/i });
      fireEvent.click(backBtn);

      await waitFor(() => {
        expect(screen.getByText('Candidate Directory Root')).toBeInTheDocument();
      });
    });

    it('surfaces backend 409 duplicate email error cleanly inside modal without closing it', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          error: {
            message: "A candidate with email 'marcus.b@example.com' already exists.",
            code: 'DUPLICATE_EMAIL',
          },
        }),
      });

      const handleSubmit = async (candData: Partial<Candidate>) => {
        const res = await fetch('/api/candidates', {
          method: 'POST',
          body: JSON.stringify(candData),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error?.message || 'Failed');
        }
      };

      render(
        <CandidateFormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
          initialData={sampleCandidate}
        />
      );

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(
          screen.getByText("A candidate with email 'marcus.b@example.com' already exists.")
        ).toBeInTheDocument();
      });

      // Modal remains open so user can rectify email
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });
  });
});
