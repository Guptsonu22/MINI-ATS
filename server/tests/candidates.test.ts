import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Candidate } from '../src/models/candidate.model.js';

describe('Candidate REST API Endpoints', () => {
  const app = createApp();

  beforeEach(async () => {
    // Clean candidate collection before each test in isolated test database
    await Candidate.deleteMany({});
  });

  const sampleCandidate = {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    appliedRole: 'Full Stack Developer',
    experience: 3,
    source: 'LinkedIn',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    notes: 'Strong candidate with full-stack capabilities.',
  };

  describe('POST /api/candidates', () => {
    it('creates a new candidate with 201 Created and default Applied stage', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .send(sampleCandidate);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toMatchObject({
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        currentStage: 'Applied',
        experience: 3,
      });
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.stageHistory).toHaveLength(1);
      expect(res.body.data.stageHistory[0]).toMatchObject({
        fromStage: null,
        toStage: 'Applied',
      });
    });

    it('rejects candidate with missing required fields (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .send({
          name: 'Incomplete Candidate',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });

    it('prevents duplicate email registration (409 Conflict)', async () => {
      await request(app).post('/api/candidates').send(sampleCandidate);

      // Attempt duplicate registration with uppercase variant to test normalization
      const duplicateRes = await request(app)
        .post('/api/candidates')
        .send({
          ...sampleCandidate,
          email: 'AARAV.SHARMA@EXAMPLE.COM',
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body).toHaveProperty('success', false);
      expect(duplicateRes.body.error).toHaveProperty('code', 'DUPLICATE_EMAIL');
    });
  });

  describe('GET /api/candidates', () => {
    beforeEach(async () => {
      // Seed 3 test candidates
      await Candidate.create([
        {
          name: 'Aarav Sharma',
          email: 'aarav@example.com',
          phone: '+91 9876543210',
          appliedRole: 'Full Stack Developer',
          experience: 3,
          source: 'LinkedIn',
          skills: ['React', 'Node.js'],
          currentStage: 'Interview',
          applicationDate: new Date('2026-10-10'),
          stageHistory: [{ toStage: 'Interview', changedAt: new Date() }],
        },
        {
          name: 'Priya Patel',
          email: 'priya@example.com',
          phone: '+91 9811122334',
          appliedRole: 'Frontend Engineer',
          experience: 5,
          source: 'Referral',
          skills: ['React', 'TypeScript'],
          currentStage: 'Offer',
          applicationDate: new Date('2026-10-05'),
          stageHistory: [{ toStage: 'Offer', changedAt: new Date() }],
        },
        {
          name: 'Rohan Verma',
          email: 'rohan@example.com',
          phone: '+91 9723456789',
          appliedRole: 'Backend Engineer',
          experience: 2,
          source: 'Careers Page',
          skills: ['Node.js', 'Go'],
          currentStage: 'Applied',
          applicationDate: new Date('2026-10-12'),
          stageHistory: [{ toStage: 'Applied', changedAt: new Date() }],
        },
      ]);
    });

    it('lists candidates with pagination metadata', async () => {
      const res = await request(app).get('/api/candidates?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        totalCandidates: 3,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('filters candidates by stage', async () => {
      const res = await request(app).get('/api/candidates?stage=Offer');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Priya Patel');
    });

    it('filters candidates by applied role', async () => {
      const res = await request(app).get('/api/candidates?role=Backend');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Rohan Verma');
    });

    it('searches candidates by name or email', async () => {
      const res = await request(app).get('/api/candidates?search=sharma');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].email).toBe('aarav@example.com');
    });

    it('sorts candidates by experience in descending order', async () => {
      const res = await request(app).get('/api/candidates?sortBy=experience&sortOrder=desc');

      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Priya Patel'); // 5 years
      expect(res.body.data[1].name).toBe('Aarav Sharma'); // 3 years
      expect(res.body.data[2].name).toBe('Rohan Verma'); // 2 years
    });
  });

  describe('GET /api/candidates/:id', () => {
    it('retrieves candidate details by valid ID (200 OK)', async () => {
      const created = await Candidate.create({
        ...sampleCandidate,
        currentStage: 'Applied',
        applicationDate: new Date(),
        stageHistory: [{ toStage: 'Applied', changedAt: new Date() }],
      });

      const res = await request(app).get(`/api/candidates/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(created.id);
      expect(res.body.data.name).toBe(sampleCandidate.name);
    });

    it('returns 400 Bad Request for malformed candidate ID', async () => {
      const res = await request(app).get('/api/candidates/invalid-non-hex-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('returns 404 Not Found for non-existent valid ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/candidates/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('code', 'CANDIDATE_NOT_FOUND');
    });
  });

  describe('PATCH /api/candidates/:id', () => {
    it('updates candidate information successfully (200 OK)', async () => {
      const created = await Candidate.create({
        ...sampleCandidate,
        currentStage: 'Applied',
        applicationDate: new Date(),
        stageHistory: [{ toStage: 'Applied', changedAt: new Date() }],
      });

      const res = await request(app)
        .patch(`/api/candidates/${created.id}`)
        .send({
          experience: 4,
          notes: 'Promoted to 4 years experience after evaluation.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.experience).toBe(4);
      expect(res.body.data.notes).toBe('Promoted to 4 years experience after evaluation.');
    });

    it('prevents updating email to one already used by another candidate (409 Conflict)', async () => {
      const cand1 = await Candidate.create({
        ...sampleCandidate,
        email: 'user1@example.com',
        currentStage: 'Applied',
        applicationDate: new Date(),
        stageHistory: [{ toStage: 'Applied', changedAt: new Date() }],
      });

      const cand2 = await Candidate.create({
        ...sampleCandidate,
        email: 'user2@example.com',
        currentStage: 'Applied',
        applicationDate: new Date(),
        stageHistory: [{ toStage: 'Applied', changedAt: new Date() }],
      });

      const res = await request(app)
        .patch(`/api/candidates/${cand2.id}`)
        .send({
          email: 'user1@example.com',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('code', 'DUPLICATE_EMAIL');
    });
  });

  describe('PATCH /api/candidates/:id/stage', () => {
    it('transitions candidate stage and appends to stageHistory (200 OK)', async () => {
      const created = await Candidate.create({
        ...sampleCandidate,
        currentStage: 'Applied',
        applicationDate: new Date(),
        stageHistory: [{ fromStage: null, toStage: 'Applied', changedAt: new Date() }],
      });

      const res = await request(app)
        .patch(`/api/candidates/${created.id}/stage`)
        .send({
          stage: 'Screening',
          note: 'Passed initial recruiter phone screen.',
          changedBy: 'Senior Recruiter',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentStage).toBe('Screening');
      expect(res.body.data.stageHistory).toHaveLength(2);

      const latestEntry = res.body.data.stageHistory[1];
      expect(latestEntry).toMatchObject({
        fromStage: 'Applied',
        toStage: 'Screening',
        note: 'Passed initial recruiter phone screen.',
        changedBy: 'Senior Recruiter',
      });
    });

    it('rejects invalid non-canonical stage (400 Bad Request)', async () => {
      const created = await Candidate.create({
        ...sampleCandidate,
        currentStage: 'Applied',
        applicationDate: new Date(),
        stageHistory: [{ toStage: 'Applied', changedAt: new Date() }],
      });

      const res = await request(app)
        .patch(`/api/candidates/${created.id}/stage`)
        .send({
          stage: 'InvalidNonCanonicalStage',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/candidates/:id', () => {
    it('deletes candidate record successfully (200 OK)', async () => {
      const created = await Candidate.create({
        ...sampleCandidate,
        currentStage: 'Applied',
        applicationDate: new Date(),
        stageHistory: [{ toStage: 'Applied', changedAt: new Date() }],
      });

      const res = await request(app).delete(`/api/candidates/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(created.id);

      // Verify record is deleted
      const checkRes = await request(app).get(`/api/candidates/${created.id}`);
      expect(checkRes.status).toBe(404);
    });

    it('returns 404 Not Found when attempting to delete non-existent candidate', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app).delete(`/api/candidates/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('code', 'CANDIDATE_NOT_FOUND');
    });
  });
});
