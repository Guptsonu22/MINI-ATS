import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('Mini ATS Frontend Application Layout', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
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
      })
    );
  });

  it('renders Mini ATS branding and primary sidebar navigation', () => {
    render(<App />);

    expect(screen.getByText('Mini ATS')).toBeInTheDocument();
    expect(screen.getByText('Recruiter SaaS')).toBeInTheDocument();

    // Verify nav links
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    expect(dashboardLinks.length).toBeGreaterThan(0);

    const candidatesLinks = screen.getAllByRole('link', { name: /candidates/i });
    expect(candidatesLinks.length).toBeGreaterThan(0);

    const pipelineLinks = screen.getAllByRole('link', { name: /pipeline/i });
    expect(pipelineLinks.length).toBeGreaterThan(0);
  });

  it('renders recruitment KPI metric cards on the dashboard', () => {
    render(<App />);

    expect(screen.getByText('Total Candidates')).toBeInTheDocument();
    expect(screen.getByText('Active Candidates')).toBeInTheDocument();
    expect(screen.getByText('Interviews Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Offers & Hires')).toBeInTheDocument();
  });

  it('renders all 6 Canonical Hiring Pipeline stages', () => {
    render(<App />);

    expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Screening').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Interview').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Offer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hired').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
  });

  it('navigates to Candidates page and renders table, search, and Add Candidate button', async () => {
    render(<App />);

    // Click Candidates link
    const candidateLinks = screen.getAllByRole('link', { name: /candidates/i });
    fireEvent.click(candidateLinks[0]!);

    // Check candidate directory header
    expect(screen.getByText('Candidate Directory')).toBeInTheDocument();

    // Check search input placeholder
    expect(screen.getByPlaceholderText('Search by candidate name or email...')).toBeInTheDocument();

    // Check filter labels
    expect(screen.getByText('Hiring Stage')).toBeInTheDocument();
    expect(screen.getAllByText('Applied Role').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Experience').length).toBeGreaterThan(0);

    // Check Add Candidate button
    const addButtons = screen.getAllByRole('button', { name: /add candidate/i });
    expect(addButtons.length).toBeGreaterThan(0);

    // Open Add Candidate modal
    fireEvent.click(addButtons[0]!);
    expect(screen.getByText('Add New Candidate')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });
});
