import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { Candidate } from '../src/types';

const sampleCandidates: Candidate[] = [
  {
    id: '6ad456742b2864621e0c0960',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    appliedRole: 'Full Stack Developer',
    experience: 3,
    source: 'LinkedIn',
    skills: ['React', 'TypeScript', 'Node.js'],
    currentStage: 'Interview',
    applicationDate: '2026-10-10T09:30:00.000Z',
    notes: 'Strong portfolio in web apps',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Applied',
        changedAt: '2026-10-10T09:30:00.000Z',
        note: 'Applied',
      },
      {
        fromStage: 'Applied',
        toStage: 'Interview',
        changedAt: '2026-10-14T14:15:00.000Z',
        note: 'Promoted to Interview',
      },
    ],
  },
  {
    id: '6ad456742b2864621e0c0961',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98111 22334',
    appliedRole: 'Frontend Engineer',
    experience: 4,
    source: 'Referral',
    skills: ['React', 'TypeScript', 'Next.js'],
    currentStage: 'Offer',
    applicationDate: '2026-10-05T14:20:00.000Z',
    stageHistory: [
      {
        fromStage: null,
        toStage: 'Offer',
        changedAt: '2026-10-05T14:20:00.000Z',
      },
    ],
  },
];

describe('Mini ATS Frontend Application Layout & Navigation', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/api/health')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                status: 'healthy',
                service: 'mini-ats-server',
                version: '1.0.0',
                uptimeSeconds: 120,
                timestamp: new Date().toISOString(),
                environment: 'test',
                nodeVersion: 'v24.21.0',
              },
            }),
          };
        }

        if (url.includes('/api/candidates')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: sampleCandidates,
              pagination: {
                page: 1,
                limit: 10,
                totalCandidates: sampleCandidates.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
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

  it('renders Mini ATS branding and primary sidebar navigation', async () => {
    render(<App />);

    expect(screen.getByText('Mini ATS')).toBeInTheDocument();
    expect(screen.getByText('Recruiter SaaS')).toBeInTheDocument();

    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    expect(dashboardLinks.length).toBeGreaterThan(0);

    const candidatesLinks = screen.getAllByRole('link', { name: /candidates/i });
    expect(candidatesLinks.length).toBeGreaterThan(0);

    const pipelineLinks = screen.getAllByRole('link', { name: /pipeline/i });
    expect(pipelineLinks.length).toBeGreaterThan(0);
  });

  it('renders recruitment KPI metric cards on the dashboard', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Total Candidates')).toBeInTheDocument();
      expect(screen.getByText('Active Candidates')).toBeInTheDocument();
      expect(screen.getByText('Interviews Scheduled')).toBeInTheDocument();
      expect(screen.getByText('Offers & Hires')).toBeInTheDocument();
      expect(screen.getAllByText('Aarav Sharma').length).toBeGreaterThan(0);
    });
  });

  it('renders all 6 Canonical Hiring Pipeline stages', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Screening').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Interview').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Offer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Hired').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
    });
  });

  it('navigates to Candidates page and renders table, search, and Add Candidate modal', async () => {
    render(<App />);

    const candidateLinks = screen.getAllByRole('link', { name: /candidates/i });
    fireEvent.click(candidateLinks[0]!);

    expect(screen.getByText('Candidate Directory')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Search by candidate name or email...')).toBeInTheDocument();
    expect(screen.getByText('Hiring Stage')).toBeInTheDocument();
    expect(screen.getAllByText('Applied Role').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Experience').length).toBeGreaterThan(0);

    const addButtons = screen.getAllByRole('button', { name: /add candidate/i });
    expect(addButtons.length).toBeGreaterThan(0);

    fireEvent.click(addButtons[0]!);
    expect(screen.getByText('Add New Candidate')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });
});
