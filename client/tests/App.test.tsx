import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Shell', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          status: 'healthy',
          service: 'mini-ats-server',
          version: '1.0.0',
          uptimeSeconds: 42,
          timestamp: new Date().toISOString(),
          environment: 'test',
          nodeVersion: 'v24.21.0',
        },
      }),
    }));
  });

  it('renders Mini ATS branding and navigation links', () => {
    render(<App />);

    expect(screen.getByText('Mini ATS')).toBeInTheDocument();
    expect(screen.getByText('Recruiter SaaS')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Candidates')).toBeInTheDocument();
    expect(screen.getByText('Hiring Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders Canonical Hiring Pipeline stages', () => {
    render(<App />);

    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Screening')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('Offer')).toBeInTheDocument();
    expect(screen.getByText('Hired')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
});
