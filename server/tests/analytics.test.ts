import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Candidate } from '../src/models/candidate.model.js';
import { CANONICAL_STAGES } from '../src/constants/stages.js';

const app = createApp();

describe('Phase 5 Analytics API (/api/analytics & /api/candidates/analytics)', () => {
  beforeEach(async () => {
    // Clean test collection
    await Candidate.deleteMany({});
  });

  it('returns empty analytics metrics when 0 candidates exist in database', async () => {
    const res = await request(app).get('/api/analytics');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCandidates).toBe(0);
    expect(res.body.data.activeCandidates).toBe(0);
    expect(res.body.data.hiredCandidates).toBe(0);
    expect(res.body.data.rejectedCandidates).toBe(0);
    expect(res.body.data.averageExperience).toBe(0);
    expect(res.body.data.hireRate).toBe(0);

    // All 6 stages exist with 0 count and 0 percentage
    CANONICAL_STAGES.forEach(stage => {
      expect(res.body.data.stageDistribution[stage]).toBe(0);
    });
    expect(res.body.data.stageBreakdown).toHaveLength(6);
    expect(res.body.data.sourceBreakdown).toEqual([]);
    expect(res.body.data.roleBreakdown).toEqual([]);
    expect(res.body.data.recentCandidates).toEqual([]);
  });

  it('derives accurate metrics from known seed candidate records', async () => {
    // Seed 6 candidates across specific stages, sources, and roles:
    // Stages:
    // - Applied: 1 (exp: 2, source: LinkedIn, role: Full Stack Developer)
    // - Screening: 1 (exp: 3, source: LinkedIn, role: Frontend Engineer)
    // - Interview: 1 (exp: 4, source: Referral, role: Backend Engineer)
    // - Offer: 1 (exp: 5, source: Referral, role: Full Stack Developer)
    // - Hired: 1 (exp: 6, source: Company Careers Page, role: Full Stack Developer)
    // - Rejected: 1 (exp: 4, source: GitHub, role: QA Automation Engineer)
    // Total: 6
    // Active (excl. Hired & Rejected): 1 + 1 + 1 + 1 = 4
    // Hired: 1
    // Rejected: 1
    // Average experience: (2 + 3 + 4 + 5 + 6 + 4) / 6 = 24 / 6 = 4.0
    // Hire rate: (1 / 6) * 100 = 16.7%

    const testSeed = [
      {
        name: 'Cand Applied',
        email: 'cand.applied@example.com',
        phone: '+1 555-0001',
        appliedRole: 'Full Stack Developer',
        experience: 2,
        source: 'LinkedIn',
        skills: ['React', 'Node.js'],
        currentStage: 'Applied',
        applicationDate: new Date('2026-10-01T10:00:00Z'),
      },
      {
        name: 'Cand Screening',
        email: 'cand.screening@example.com',
        phone: '+1 555-0002',
        appliedRole: 'Frontend Engineer',
        experience: 3,
        source: 'LinkedIn',
        skills: ['React', 'TypeScript'],
        currentStage: 'Screening',
        applicationDate: new Date('2026-10-02T10:00:00Z'),
      },
      {
        name: 'Cand Interview',
        email: 'cand.interview@example.com',
        phone: '+1 555-0003',
        appliedRole: 'Backend Engineer',
        experience: 4,
        source: 'Referral',
        skills: ['Node.js', 'PostgreSQL'],
        currentStage: 'Interview',
        applicationDate: new Date('2026-10-03T10:00:00Z'),
      },
      {
        name: 'Cand Offer',
        email: 'cand.offer@example.com',
        phone: '+1 555-0004',
        appliedRole: 'Full Stack Developer',
        experience: 5,
        source: 'Referral',
        skills: ['React', 'MongoDB'],
        currentStage: 'Offer',
        applicationDate: new Date('2026-10-04T10:00:00Z'),
      },
      {
        name: 'Cand Hired',
        email: 'cand.hired@example.com',
        phone: '+1 555-0005',
        appliedRole: 'Full Stack Developer',
        experience: 6,
        source: 'Company Careers Page',
        skills: ['Full Stack', 'AWS'],
        currentStage: 'Hired',
        applicationDate: new Date('2026-10-05T10:00:00Z'),
      },
      {
        name: 'Cand Rejected',
        email: 'cand.rejected@example.com',
        phone: '+1 555-0006',
        appliedRole: 'QA Automation Engineer',
        experience: 4,
        source: 'GitHub',
        skills: ['Playwright', 'Jest'],
        currentStage: 'Rejected',
        applicationDate: new Date('2026-10-06T10:00:00Z'),
      },
    ];

    await Candidate.create(testSeed);

    const res = await request(app).get('/api/analytics');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;

    // Totals & Active definition check
    expect(data.totalCandidates).toBe(6);
    expect(data.activeCandidates).toBe(4); // Strictly excludes Hired (1) and Rejected (1)
    expect(data.hiredCandidates).toBe(1);
    expect(data.rejectedCandidates).toBe(1);
    expect(data.inInterview).toBe(1);
    expect(data.offersExtended).toBe(1);
    expect(data.screeningCount).toBe(1);
    expect(data.appliedCount).toBe(1);

    // Consistency assertion: Active + Hired + Rejected == Total
    expect(data.activeCandidates + data.hiredCandidates + data.rejectedCandidates).toBe(
      data.totalCandidates
    );

    // Average experience: 24 / 6 = 4.0
    expect(data.averageExperience).toBe(4.0);

    // Hire rate: (1 / 6) * 100 = 16.7%
    expect(data.hireRate).toBe(16.7);

    // Stage Distribution map
    expect(data.stageDistribution).toEqual({
      Applied: 1,
      Screening: 1,
      Interview: 1,
      Offer: 1,
      Hired: 1,
      Rejected: 1,
    });

    // Stage breakdown percentages: 1/6 = 16.7%
    expect(data.stageBreakdown).toHaveLength(6);
    data.stageBreakdown.forEach((item: { stage: string; count: number; percentage: number }) => {
      expect(item.count).toBe(1);
      expect(item.percentage).toBe(16.7);
    });

    // Source breakdown: LinkedIn (2), Referral (2), Company Careers Page (1), GitHub (1)
    expect(data.sourceBreakdown).toEqual(
      expect.arrayContaining([
        { source: 'LinkedIn', count: 2, percentage: 33.3 },
        { source: 'Referral', count: 2, percentage: 33.3 },
        { source: 'Company Careers Page', count: 1, percentage: 16.7 },
        { source: 'GitHub', count: 1, percentage: 16.7 },
      ])
    );

    // Role breakdown: Full Stack Developer (3), Frontend Engineer (1), Backend Engineer (1), QA Automation Engineer (1)
    const fsRole = data.roleBreakdown.find(
      (r: { role: string }) => r.role === 'Full Stack Developer'
    );
    expect(fsRole).toEqual({ role: 'Full Stack Developer', count: 3, percentage: 50 });

    // Recent candidates: 5 most recent records
    expect(data.recentCandidates).toHaveLength(5);
    expect(data.recentCandidates[0].name).toBe('Cand Rejected'); // Latest application date (Oct 6)
  });

  it('serves analytics on both /api/analytics and /api/candidates/analytics', async () => {
    await Candidate.create({
      name: 'Single Candidate',
      email: 'single@example.com',
      phone: '+1 555-1111',
      appliedRole: 'Full Stack Developer',
      experience: 3,
      source: 'LinkedIn',
      skills: ['React'],
      currentStage: 'Interview',
      applicationDate: new Date(),
    });

    const res1 = await request(app).get('/api/analytics');
    const res2 = await request(app).get('/api/candidates/analytics');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.data.totalCandidates).toBe(1);
    expect(res2.body.data.totalCandidates).toBe(1);
    expect(res1.body.data.activeCandidates).toBe(1);
    expect(res2.body.data.activeCandidates).toBe(1);
  });
});
