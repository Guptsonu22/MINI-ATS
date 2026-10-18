import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../src/context/ToastContext';
import { CandidatesPage } from '../src/pages/CandidatesPage';
import { CandidateDetailPage } from '../src/pages/CandidateDetailPage';
import { candidatesApi } from '../src/api/candidates.api';
import { Candidate } from '../src/types';

const mockCandidates: Candidate[] = [
  {
    id: 'cand-101',
    name: 'Devin Thorne',
    email: 'devin.thorne@example.com',
    phone: '+1 555-0199',
    appliedRole: 'Full Stack Developer',
    experience: 4,
    source: 'LinkedIn',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    currentStage: 'Interview',
    applicationDate: '2026-10-12T10:00:00.000Z',
    notes: 'Strong system design experience.',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: '2026-10-12T10:00:00.000Z',
        note: 'Applied via job board',
      },
      {
        fromStage: 'Applied',
        toStage: 'Interview',
        changedAt: '2026-10-14T15:00:00.000Z',
        note: 'Passed screening',
      },
    ],
  },
  {
    id: 'cand-102',
    name: 'Sarah Connor',
    email: 'sarah.c@example.com',
    phone: '+1 555-0144',
    appliedRole: 'Backend Engineer',
    experience: 6,
    source: 'Referral',
    skills: ['Go', 'PostgreSQL', 'Docker'],
    currentStage: 'Offer',
    applicationDate: '2026-10-08T11:00:00.000Z',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: '2026-10-08T11:00:00.000Z',
      },
      {
        fromStage: 'Applied',
        toStage: 'Offer',
        changedAt: '2026-10-15T09:00:00.000Z',
      },
    ],
  },
];

describe('Phase 4: Candidate Integration Workflows & API Service', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Candidate API Service Layer', () => {
    it('fetches candidates with query parameters correctly', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCandidates,
          pagination: {
            page: 1,
            limit: 10,
            totalCandidates: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });

      const result = await candidatesApi.getCandidates({
        search: 'Devin',
        stage: 'Interview',
        minExp: 2,
        maxExp: 5,
      });

      expect(fetchMock).toHaveBeenCalled();
      const calledUrl = fetchMock.mock.calls[0]![0] as string;
      expect(calledUrl).toContain('/api/candidates');
      expect(calledUrl).toContain('search=Devin');
      expect(calledUrl).toContain('stage=Interview');
      expect(calledUrl).toContain('minExp=2');
      expect(calledUrl).toContain('maxExp=5');

      expect(result.candidates).toHaveLength(2);
      expect(result.candidates[0]!.name).toBe('Devin Thorne');
      expect(result.pagination.totalCandidates).toBe(2);
    });

    it('creates a new candidate record via POST', async () => {
      const newPayload = {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        phone: '+1 555-0987',
        appliedRole: 'Product Designer',
        experience: 5,
        source: 'Company Careers Page',
        skills: ['Figma', 'UI/UX'],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'cand-103', ...newPayload, currentStage: 'Applied', stageHistory: [] },
        }),
      });

      const created = await candidatesApi.createCandidate(newPayload);

      expect(fetchMock).toHaveBeenCalled();
      const [url, options] = fetchMock.mock.calls[0]!;
      expect(url).toContain('/api/candidates');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toMatchObject({ name: 'Elena Rostova' });
      expect(created.id).toBe('cand-103');
    });

    it('updates candidate stage with note and changedBy audit metadata', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...mockCandidates[0], currentStage: 'Offer' },
        }),
      });

      const updated = await candidatesApi.updateCandidateStage('cand-101', {
        stage: 'Offer',
        note: 'Advanced to offer stage',
        changedBy: 'Lead Recruiter',
      });

      expect(fetchMock).toHaveBeenCalled();
      const [url, options] = fetchMock.mock.calls[0]!;
      expect(url).toContain('/api/candidates/cand-101/stage');
      expect(options.method).toBe('PATCH');
      expect(JSON.parse(options.body)).toEqual({
        stage: 'Offer',
        note: 'Advanced to offer stage',
        changedBy: 'Lead Recruiter',
      });
      expect(updated.currentStage).toBe('Offer');
    });

    it('deletes candidate by ID via DELETE', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Candidate deleted successfully',
          data: { id: 'cand-101' },
        }),
      });

      const result = await candidatesApi.deleteCandidate('cand-101');
      const [url, options] = fetchMock.mock.calls[0]!;
      expect(url).toContain('/api/candidates/cand-101');
      expect(options.method).toBe('DELETE');
      expect(result.id).toBe('cand-101');
    });

    it('throws ApiError with server message when API returns failure status', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          error: {
            message: 'A candidate with this email address already exists.',
            code: 'DUPLICATE_EMAIL',
          },
        }),
      });

      await expect(
        candidatesApi.createCandidate({
          name: 'Duplicate User',
          email: 'duplicate@example.com',
          phone: '+1 555-9999',
          appliedRole: 'Backend Engineer',
          experience: 2,
          source: 'Direct',
          skills: ['Node.js'],
        })
      ).rejects.toThrow('A candidate with this email address already exists.');
    });
  });

  describe('CandidatesPage Integration UI Flows', () => {
    it('renders real candidates loaded from API and candidate count', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCandidates,
          pagination: {
            page: 1,
            limit: 10,
            totalCandidates: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });

      render(
        <ToastProvider>
          <MemoryRouter>
            <CandidatesPage />
          </MemoryRouter>
        </ToastProvider>
      );

      // Verify header and candidate records appear
      await waitFor(() => {
        expect(screen.getByText('Devin Thorne')).toBeInTheDocument();
        expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
        expect(screen.getByText('2 Total')).toBeInTheDocument();
      });
    });

    it('displays server error banner and retry action on network or API failure without showing fake data', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Failed to fetch'));

      render(
        <ToastProvider>
          <MemoryRouter>
            <CandidatesPage />
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Candidates')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument();
      });

      // Verify no fake data is displayed
      expect(screen.queryByText('Aarav Sharma')).not.toBeInTheDocument();
      expect(screen.queryByText('Devin Thorne')).not.toBeInTheDocument();
    });

    it('opens Add Candidate modal and validates mandatory inputs', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCandidates,
          pagination: {
            page: 1,
            limit: 10,
            totalCandidates: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });

      render(
        <ToastProvider>
          <MemoryRouter>
            <CandidatesPage />
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Devin Thorne')).toBeInTheDocument();
      });

      // Click Add Candidate button
      const addBtn = screen.getByRole('button', { name: /add candidate/i });
      fireEvent.click(addBtn);

      // Verify Modal opens
      expect(screen.getByText('Add New Candidate')).toBeInTheDocument();

      // Submit empty form
      const submitBtn = screen.getByRole('button', { name: /create candidate/i });
      fireEvent.click(submitBtn);

      // Verify client validation messages
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Email address is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });

    it('deletes candidate via confirmation dialog and refreshes list', async () => {
      // 1. Initial list
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCandidates,
          pagination: {
            page: 1,
            limit: 10,
            totalCandidates: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });

      // 2. Delete response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Candidate deleted',
          data: { id: 'cand-101' },
        }),
      });

      // 3. Refreshed list
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockCandidates[1]],
          pagination: {
            page: 1,
            limit: 10,
            totalCandidates: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });

      render(
        <ToastProvider>
          <MemoryRouter>
            <CandidatesPage />
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Devin Thorne')).toBeInTheDocument();
      });

      // Click delete button for first candidate
      const deleteButtons = screen.getAllByRole('button', { name: /delete devin thorne/i });
      fireEvent.click(deleteButtons[0]!);

      // Confirm dialog opens
      expect(screen.getByText('Delete Candidate Record')).toBeInTheDocument();
      const confirmBtn = screen.getByRole('button', { name: 'Delete Candidate' });
      fireEvent.click(confirmBtn);

      // Verify delete request was dispatched
      await waitFor(() => {
        const deleteCall = fetchMock.mock.calls.find(c => c[1]?.method === 'DELETE');
        expect(deleteCall).toBeDefined();
        expect(deleteCall![0]).toContain('/api/candidates/cand-101');
      });
    });
  });

  describe('CandidateDetailPage Integration UI Flows', () => {
    it('fetches and renders candidate details and complete stage timeline', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCandidates[0],
        }),
      });

      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/candidates/cand-101']}>
            <Routes>
              <Route path="/candidates/:id" element={<CandidateDetailPage />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Devin Thorne')).toBeInTheDocument();
        expect(screen.getByText('devin.thorne@example.com')).toBeInTheDocument();
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
        expect(screen.getByText('Hiring Pipeline History')).toBeInTheDocument();
        expect(screen.getByText('Passed screening')).toBeInTheDocument();
      });
    });

    it('promotes candidate stage through modal transition and updates UI', async () => {
      // 1. Initial fetch
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCandidates[0],
        }),
      });

      // 2. Stage update PATCH
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            ...mockCandidates[0],
            currentStage: 'Offer',
            stageHistory: [
              ...mockCandidates[0]!.stageHistory,
              {
                fromStage: 'Interview',
                toStage: 'Offer',
                changedAt: new Date().toISOString(),
                note: 'Cleared final interview round',
                changedBy: 'Recruiter',
              },
            ],
          },
        }),
      });

      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/candidates/cand-101']}>
            <Routes>
              <Route path="/candidates/:id" element={<CandidateDetailPage />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Devin Thorne')).toBeInTheDocument();
      });

      // Click Update Stage button
      const updateStageBtn = screen.getByRole('button', { name: /update stage/i });
      fireEvent.click(updateStageBtn);

      // Verify modal opens
      expect(screen.getByText('Promote Candidate Stage')).toBeInTheDocument();

      // Change target stage to Offer
      const stageSelect = screen.getByLabelText(/target stage/i);
      fireEvent.change(stageSelect, { target: { value: 'Offer' } });

      // Enter transition note
      const noteInput = screen.getByLabelText(/transition reason/i);
      fireEvent.change(noteInput, { target: { value: 'Cleared final interview round' } });

      // Click Confirm Transition
      const confirmBtn = screen.getByRole('button', { name: /confirm transition/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        const patchCall = fetchMock.mock.calls.find(c => c[1]?.method === 'PATCH');
        expect(patchCall).toBeDefined();
        expect(patchCall![0]).toContain('/api/candidates/cand-101/stage');
        expect(JSON.parse(patchCall![1].body)).toMatchObject({
          stage: 'Offer',
          note: 'Cleared final interview round',
        });
      });
    });

    it('shows error state when candidate record is not found', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: { message: 'Candidate not found', code: 'NOT_FOUND' },
        }),
      });

      render(
        <ToastProvider>
          <MemoryRouter initialEntries={['/candidates/invalid-id']}>
            <Routes>
              <Route path="/candidates/:id" element={<CandidateDetailPage />} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Candidate Record Not Found')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /back to candidate directory/i })).toBeInTheDocument();
      });
    });
  });
});
