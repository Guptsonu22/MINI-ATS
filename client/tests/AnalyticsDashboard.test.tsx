import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../src/pages/DashboardPage';
import { ToastProvider } from '../src/context/ToastContext';
import { AnalyticsData } from '../src/types';

const mockAnalyticsData: AnalyticsData = {
  totalCandidates: 10,
  activeCandidates: 7, // Applied(2) + Screening(2) + Interview(2) + Offer(1) = 7
  hiredCandidates: 2,
  rejectedCandidates: 1,
  inInterview: 2,
  offersExtended: 1,
  screeningCount: 2,
  appliedCount: 2,
  averageExperience: 4.1,
  hireRate: 20, // 2/10 = 20%
  stageDistribution: {
    Applied: 2,
    Screening: 2,
    Interview: 2,
    Offer: 1,
    Hired: 2,
    Rejected: 1,
  },
  stageBreakdown: [
    { stage: 'Applied', count: 2, percentage: 20 },
    { stage: 'Screening', count: 2, percentage: 20 },
    { stage: 'Interview', count: 2, percentage: 20 },
    { stage: 'Offer', count: 1, percentage: 10 },
    { stage: 'Hired', count: 2, percentage: 20 },
    { stage: 'Rejected', count: 1, percentage: 10 },
  ],
  sourceBreakdown: [
    { source: 'LinkedIn', count: 5, percentage: 50 },
    { source: 'Referral', count: 3, percentage: 30 },
    { source: 'GitHub', count: 2, percentage: 20 },
  ],
  roleBreakdown: [
    { role: 'Full Stack Developer', count: 6, percentage: 60 },
    { role: 'Frontend Engineer', count: 4, percentage: 40 },
  ],
  recentCandidates: [
    {
      id: 'cand-001',
      name: 'Rohan Mehra',
      email: 'rohan.mehra@example.com',
      phone: '+91 98765 11223',
      appliedRole: 'Full Stack Developer',
      experience: 4,
      source: 'LinkedIn',
      skills: ['React', 'Node.js', 'MongoDB'],
      currentStage: 'Interview',
      applicationDate: '2026-10-18T10:00:00.000Z',
      stageHistory: [
        { fromStage: null, toStage: 'Applied', changedAt: '2026-10-15T09:00:00.000Z' },
        { fromStage: 'Applied', toStage: 'Interview', changedAt: '2026-10-18T10:00:00.000Z' },
      ],
    },
    {
      id: 'cand-002',
      name: 'Simran Kaur',
      email: 'simran.kaur@example.com',
      phone: '+91 99881 22334',
      appliedRole: 'Frontend Engineer',
      experience: 3,
      source: 'Referral',
      skills: ['React', 'TypeScript', 'Tailwind'],
      currentStage: 'Hired',
      applicationDate: '2026-10-17T11:30:00.000Z',
      stageHistory: [
        { fromStage: null, toStage: 'Applied', changedAt: '2026-10-10T09:00:00.000Z' },
        { fromStage: 'Applied', toStage: 'Hired', changedAt: '2026-10-17T11:30:00.000Z' },
      ],
    },
  ],
};

const renderDashboard = () => {
  return render(
    <ToastProvider>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </ToastProvider>
  );
};

describe('Phase 5: Recruitment Analytics Dashboard', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/api/analytics')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: mockAnalyticsData,
            }),
          };
        }

        return {
          ok: true,
          json: async () => ({ success: true, data: {} }),
        };
      })
    );
  });

  it('renders all real dashboard metric cards derived from MongoDB records', async () => {
    renderDashboard();

    await waitFor(() => {
      // Header
      expect(screen.getByText('Recruitment Dashboard')).toBeInTheDocument();

      // Metric card titles and values
      expect(screen.getByText('Total Candidates')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();

      // Active pipeline: strictly excludes Hired & Rejected (7)
      expect(screen.getByText('Active Candidates')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('Excludes Hired and Rejected')).toBeInTheDocument();

      // Interviews scheduled (2)
      expect(screen.getByText('Interviews Scheduled')).toBeInTheDocument();

      // Offers & Hires (1 offer + 2 hired = 3)
      expect(screen.getByText('Offers & Hires')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      // Secondary row cards
      expect(screen.getAllByText('Offers Extended').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
      expect(screen.getByText('Average Experience')).toBeInTheDocument();
      expect(screen.getByText('4.1 yrs')).toBeInTheDocument();
    });
  });

  it('renders Stage Distribution breakdown chips for all 6 canonical stages', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Hiring Pipeline Distribution')).toBeInTheDocument();
      expect(screen.getByText('10 Total Applicants')).toBeInTheDocument();

      // All 6 stages represented
      expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Screening').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Interview').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Offer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Hired').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
    });
  });

  it('renders Recent Candidates section with status badges and candidate details', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Recent Candidates')).toBeInTheDocument();
      expect(screen.getByText('Rohan Mehra')).toBeInTheDocument();
      expect(screen.getByText('Simran Kaur')).toBeInTheDocument();
      expect(screen.getByText('4 yr exp')).toBeInTheDocument();
      expect(screen.getByText('3 yr exp')).toBeInTheDocument();
    });
  });

  it('renders Sourcing and Applied Roles demographic breakdowns', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Candidate Sourcing')).toBeInTheDocument();
      expect(screen.getAllByText('LinkedIn').length).toBeGreaterThan(0);
      expect(screen.getByText('Applied Roles')).toBeInTheDocument();
      expect(screen.getAllByText('Full Stack Developer').length).toBeGreaterThan(0);
    });
  });

  it('handles empty database state with friendly empty call-to-action', async () => {
    const emptyAnalytics: AnalyticsData = {
      totalCandidates: 0,
      activeCandidates: 0,
      hiredCandidates: 0,
      rejectedCandidates: 0,
      inInterview: 0,
      offersExtended: 0,
      screeningCount: 0,
      appliedCount: 0,
      averageExperience: 0,
      hireRate: 0,
      stageDistribution: {
        Applied: 0,
        Screening: 0,
        Interview: 0,
        Offer: 0,
        Hired: 0,
        Rejected: 0,
      },
      stageBreakdown: [
        { stage: 'Applied', count: 0, percentage: 0 },
        { stage: 'Screening', count: 0, percentage: 0 },
        { stage: 'Interview', count: 0, percentage: 0 },
        { stage: 'Offer', count: 0, percentage: 0 },
        { stage: 'Hired', count: 0, percentage: 0 },
        { stage: 'Rejected', count: 0, percentage: 0 },
      ],
      sourceBreakdown: [],
      roleBreakdown: [],
      recentCandidates: [],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => ({
        ok: true,
        json: async () => ({
          success: true,
          data: emptyAnalytics,
        }),
      }))
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No Candidates in Pipeline Yet')).toBeInTheDocument();
      expect(screen.getByText('Add First Candidate')).toBeInTheDocument();
    });
  });

  it('handles server network error state with retry connection option', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => {
        throw new Error('Failed to fetch');
      })
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Unable to Fetch Dashboard Data')).toBeInTheDocument();
      expect(
        screen.getByText('Unable to connect to the ATS API server. Please check your network connection.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument();
    });
  });
});
