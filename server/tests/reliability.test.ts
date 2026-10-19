import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Candidate } from '../src/models/candidate.model.js';

const app = createApp();

describe('Phase 6: Backend Reliability & Boundary Audit', () => {
  beforeEach(async () => {
    // Clean test collection before each test
    await Candidate.deleteMany({});
  });

  const baseCandidate = {
    name: 'Reliability Test Candidate',
    email: 'reliability.user@example.com',
    phone: '+1 555-0100',
    appliedRole: 'Senior QA Automation Engineer',
    experience: 5,
    source: 'LinkedIn',
    skills: ['TypeScript', 'Playwright', 'Jest', 'MongoDB'],
    notes: 'Initial evaluation profile.',
  };

  describe('1. Invalid MongoDB IDs and Missing Records Handling', () => {
    it('returns 400 Bad Request with VALIDATION_ERROR on malformed candidate ID for all operations', async () => {
      const invalidId = '123-malformed-id-non-hex';

      // GET
      const getRes = await request(app).get(`/api/candidates/${invalidId}`);
      expect(getRes.status).toBe(400);
      expect(getRes.body.success).toBe(false);
      expect(getRes.body.error.code).toBe('VALIDATION_ERROR');

      // PATCH
      const patchRes = await request(app)
        .patch(`/api/candidates/${invalidId}`)
        .send({ experience: 6 });
      expect(patchRes.status).toBe(400);
      expect(patchRes.body.success).toBe(false);
      expect(patchRes.body.error.code).toBe('VALIDATION_ERROR');

      // PATCH /stage
      const stageRes = await request(app)
        .patch(`/api/candidates/${invalidId}/stage`)
        .send({ stage: 'Screening' });
      expect(stageRes.status).toBe(400);
      expect(stageRes.body.success).toBe(false);
      expect(stageRes.body.error.code).toBe('VALIDATION_ERROR');

      // DELETE
      const deleteRes = await request(app).delete(`/api/candidates/${invalidId}`);
      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body.success).toBe(false);
      expect(deleteRes.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 Not Found with CANDIDATE_NOT_FOUND on non-existent valid 24-hex ObjectId', async () => {
      const missingValidId = '654321098765432109876543';

      const getRes = await request(app).get(`/api/candidates/${missingValidId}`);
      expect(getRes.status).toBe(404);
      expect(getRes.body.success).toBe(false);
      expect(getRes.body.error.code).toBe('CANDIDATE_NOT_FOUND');

      const patchRes = await request(app)
        .patch(`/api/candidates/${missingValidId}`)
        .send({ experience: 6 });
      expect(patchRes.status).toBe(404);
      expect(patchRes.body.error.code).toBe('CANDIDATE_NOT_FOUND');

      const deleteRes = await request(app).delete(`/api/candidates/${missingValidId}`);
      expect(deleteRes.status).toBe(404);
      expect(deleteRes.body.error.code).toBe('CANDIDATE_NOT_FOUND');
    });
  });

  describe('2. Duplicate and Invalid Email Handling', () => {
    it('rejects improperly formatted email addresses with 400 Bad Request', async () => {
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'username@.com',
        'user@domain..com',
        'spaces in email@example.com',
      ];

      for (const email of invalidEmails) {
        const res = await request(app).post('/api/candidates').send({
          ...baseCandidate,
          email,
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('enforces case-insensitive duplicate email protection', async () => {
      // 1. Create with lowercase
      const firstRes = await request(app).post('/api/candidates').send({
        ...baseCandidate,
        email: 'case.sensitive@example.com',
      });
      expect(firstRes.status).toBe(201);

      // 2. Attempt duplicate creation with mixed uppercase
      const dupRes = await request(app).post('/api/candidates').send({
        ...baseCandidate,
        name: 'Another Person',
        email: 'CASE.SENSITIVE@EXAMPLE.COM',
      });
      expect(dupRes.status).toBe(409);
      expect(dupRes.body.success).toBe(false);
      expect(dupRes.body.error.code).toBe('DUPLICATE_EMAIL');

      // 3. Updating candidate to their own same email (with different case) succeeds
      const selfUpdateRes = await request(app)
        .patch(`/api/candidates/${firstRes.body.data.id}`)
        .send({ email: 'Case.Sensitive@Example.Com' });
      expect(selfUpdateRes.status).toBe(200);
    });
  });

  describe('3. Search, Filter, and ReDoS Sanitization', () => {
    beforeEach(async () => {
      await Candidate.create([
        {
          name: 'Jane (Special Char) Doe',
          email: 'jane.special@example.com',
          phone: '+1 555-0101',
          appliedRole: 'Full Stack Engineer (React/Node)',
          experience: 4,
          source: 'GitHub',
          skills: ['React', 'Node.js'],
          currentStage: 'Applied',
          applicationDate: new Date('2026-10-10'),
          stageHistory: [{ toStage: 'Applied', changedAt: new Date() }],
        },
        {
          name: 'Bob [Brackets] Smith',
          email: 'bob.brackets@example.com',
          phone: '+1 555-0102',
          appliedRole: 'DevOps & SRE Engineer',
          experience: 8,
          source: 'LinkedIn',
          skills: ['Kubernetes', 'Terraform'],
          currentStage: 'Interview',
          applicationDate: new Date('2026-10-12'),
          stageHistory: [{ toStage: 'Interview', changedAt: new Date() }],
        },
      ]);
    });

    it('safely handles regex metacharacters in search queries without crashing', async () => {
      const maliciousQueries = [
        '\\',
        '[',
        ']',
        '(',
        ')',
        '*',
        '+',
        '?',
        '{',
        '}',
        '^',
        '$',
        '|',
        '(a+)+b', // classic ReDoS pattern
      ];

      for (const q of maliciousQueries) {
        const res = await request(app).get(`/api/candidates?search=${encodeURIComponent(q)}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    it('matches literal special characters correctly after escaping', async () => {
      const res = await request(app).get('/api/candidates?search=(Special Char)');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Jane (Special Char) Doe');
    });

    it('filters accurately by inclusive experience ranges', async () => {
      const res = await request(app).get('/api/candidates?minExp=3&maxExp=5');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].experience).toBe(4);
    });
  });

  describe('4. Every Permitted Canonical Stage Transition', () => {
    it('successfully transitions through all 6 canonical hiring stages with complete audit history', async () => {
      const createRes = await request(app).post('/api/candidates').send(baseCandidate);
      const candId = createRes.body.data.id;
      expect(createRes.body.data.currentStage).toBe('Applied');

      // Canonical pipeline progression
      const progressionStages: CanonicalStage[] = [
        'Screening',
        'Interview',
        'Offer',
        'Hired',
        'Rejected',
        'Applied', // Re-entry test
      ];

      let previousStage: CanonicalStage = 'Applied';

      for (const targetStage of progressionStages) {
        const res = await request(app)
          .patch(`/api/candidates/${candId}/stage`)
          .send({
            stage: targetStage,
            note: `Testing transition from ${previousStage} to ${targetStage}`,
            changedBy: 'Audit System',
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.currentStage).toBe(targetStage);

        const latestHistory =
          res.body.data.stageHistory[res.body.data.stageHistory.length - 1];
        expect(latestHistory.fromStage).toBe(previousStage);
        expect(latestHistory.toStage).toBe(targetStage);
        expect(latestHistory.note).toContain(`Testing transition from ${previousStage} to ${targetStage}`);

        previousStage = targetStage;
      }

      // Verify total entries in stageHistory (Initial Applied + 6 transitions = 7)
      const finalRes = await request(app).get(`/api/candidates/${candId}`);
      expect(finalRes.body.data.stageHistory).toHaveLength(7);
    });

    it('rejects transition to non-canonical stage names with 400 Bad Request', async () => {
      const createRes = await request(app).post('/api/candidates').send(baseCandidate);
      const candId = createRes.body.data.id;

      const invalidStages = ['UnderReview', 'OnHold', 'Accepted', 'Passed', 'Withdrawn'];

      for (const stage of invalidStages) {
        const res = await request(app)
          .patch(`/api/candidates/${candId}/stage`)
          .send({ stage });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('5. Form Validation & Boundary Conditions', () => {
    it('rejects negative experience and experience over 50 years', async () => {
      const negRes = await request(app)
        .post('/api/candidates')
        .send({ ...baseCandidate, email: 'neg@test.com', experience: -1 });
      expect(negRes.status).toBe(400);
      expect(negRes.body.error.code).toBe('VALIDATION_ERROR');

      const highRes = await request(app)
        .post('/api/candidates')
        .send({ ...baseCandidate, email: 'high@test.com', experience: 51 });
      expect(highRes.status).toBe(400);
      expect(highRes.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects phone numbers with fewer than 3 characters', async () => {
      const shortPhoneRes = await request(app)
        .post('/api/candidates')
        .send({ ...baseCandidate, email: 'phone@test.com', phone: '12' });
      expect(shortPhoneRes.status).toBe(400);
      expect(shortPhoneRes.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects candidates with empty skills', async () => {
      const emptySkillsRes = await request(app)
        .post('/api/candidates')
        .send({ ...baseCandidate, email: 'skills@test.com', skills: [] });
      expect(emptySkillsRes.status).toBe(400);
      expect(emptySkillsRes.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid resume URLs', async () => {
      const invalidUrlRes = await request(app)
        .post('/api/candidates')
        .send({ ...baseCandidate, email: 'url@test.com', resumeUrl: 'not-a-valid-url' });
      expect(invalidUrlRes.status).toBe(400);
      expect(invalidUrlRes.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('6. Dashboard Consistency Across State Transitions', () => {
    it('maintains strict activeCandidates invariant across stage transitions and deletions', async () => {
      // 1. Create candidate (starts in Applied)
      const cand = await request(app).post('/api/candidates').send(baseCandidate);
      const candId = cand.body.data.id;

      let analytics = await request(app).get('/api/analytics');
      expect(analytics.body.data.totalCandidates).toBe(1);
      expect(analytics.body.data.activeCandidates).toBe(1);
      expect(analytics.body.data.hiredCandidates).toBe(0);
      expect(analytics.body.data.rejectedCandidates).toBe(0);

      // Invariant check: active + hired + rejected === total
      expect(
        analytics.body.data.activeCandidates +
          analytics.body.data.hiredCandidates +
          analytics.body.data.rejectedCandidates
      ).toBe(analytics.body.data.totalCandidates);

      // 2. Promote to Hired
      await request(app)
        .patch(`/api/candidates/${candId}/stage`)
        .send({ stage: 'Hired' });

      analytics = await request(app).get('/api/analytics');
      expect(analytics.body.data.totalCandidates).toBe(1);
      expect(analytics.body.data.activeCandidates).toBe(0); // Excludes Hired!
      expect(analytics.body.data.hiredCandidates).toBe(1);
      expect(analytics.body.data.rejectedCandidates).toBe(0);
      expect(
        analytics.body.data.activeCandidates +
          analytics.body.data.hiredCandidates +
          analytics.body.data.rejectedCandidates
      ).toBe(analytics.body.data.totalCandidates);

      // 3. Transition to Rejected
      await request(app)
        .patch(`/api/candidates/${candId}/stage`)
        .send({ stage: 'Rejected' });

      analytics = await request(app).get('/api/analytics');
      expect(analytics.body.data.totalCandidates).toBe(1);
      expect(analytics.body.data.activeCandidates).toBe(0); // Excludes Rejected!
      expect(analytics.body.data.hiredCandidates).toBe(0);
      expect(analytics.body.data.rejectedCandidates).toBe(1);
      expect(
        analytics.body.data.activeCandidates +
          analytics.body.data.hiredCandidates +
          analytics.body.data.rejectedCandidates
      ).toBe(analytics.body.data.totalCandidates);

      // 4. Delete candidate
      await request(app).delete(`/api/candidates/${candId}`);

      analytics = await request(app).get('/api/analytics');
      expect(analytics.body.data.totalCandidates).toBe(0);
      expect(analytics.body.data.activeCandidates).toBe(0);
      expect(analytics.body.data.hiredCandidates).toBe(0);
      expect(analytics.body.data.rejectedCandidates).toBe(0);
    });
  });
});
