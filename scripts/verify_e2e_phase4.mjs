// scripts/verify_e2e_phase4.mjs
// Node.js End-to-End Live Verification Suite for Mini ATS Phase 4

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:5173';

console.log('=========================================================');
console.log('  MINI ATS — PHASE 4 E2E LIVE SYSTEM VERIFICATION        ');
console.log('=========================================================');

async function runVerification() {
  let failed = false;

  // 1. Health check & DB connection
  console.log('\n[1/7] Testing Health Endpoint & DB Connection...');
  try {
    const res = await fetch(`${API_BASE}/health`);
    const json = await res.json();
    if (res.ok && json.success && json.data.database.state === 'connected') {
      console.log(` ✓ PASS: Backend is healthy (DB: ${json.data.database.name}, host: ${json.data.database.host})`);
    } else {
      throw new Error(`Unexpected health payload: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    console.error(` ✗ FAIL: Health check failed:`, err.message);
    failed = true;
  }

  // 2. Frontend status
  console.log('\n[2/7] Testing Frontend Dev Server...');
  try {
    const res = await fetch(FRONTEND_BASE);
    if (res.ok) {
      console.log(` ✓ PASS: Frontend is active at ${FRONTEND_BASE} (HTTP ${res.status})`);
    } else {
      throw new Error(`Frontend returned HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(` ✗ FAIL: Frontend server check failed:`, err.message);
    failed = true;
  }

  // 3. Create Candidate (POST /api/candidates)
  console.log('\n[3/7] Testing Candidate Creation (POST /api/candidates)...');
  let candidateId = null;
  const uniqueEmail = `alex.rivera.e2e.${Date.now()}@example.com`;
  const candidatePayload = {
    name: 'Alex Rivera',
    email: uniqueEmail,
    phone: '+1 555-234-5678',
    appliedRole: 'Full Stack Developer',
    experience: 4,
    source: 'LinkedIn',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    currentStage: 'Applied',
    resumeUrl: 'https://example.com/resumes/alex_rivera.pdf',
    notes: 'Strong system design skills and modern React patterns.',
  };

  try {
    const res = await fetch(`${API_BASE}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidatePayload),
    });
    const json = await res.json();
    if (res.status === 201 && json.success && json.data.id) {
      candidateId = json.data.id;
      console.log(` ✓ PASS: Candidate created successfully:`);
      console.log(`        ID: ${candidateId} | Name: ${json.data.name} | Stage: ${json.data.currentStage}`);
    } else {
      throw new Error(`Creation failed: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    console.error(` ✗ FAIL: Candidate creation failed:`, err.message);
    failed = true;
  }

  // 4. Duplicate Email Protection (409 Conflict)
  console.log('\n[4/7] Testing Duplicate Email Protection (409 Conflict)...');
  try {
    const res = await fetch(`${API_BASE}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidatePayload),
    });
    const json = await res.json();
    if (res.status === 409 && !json.success && json.error.code === 'DUPLICATE_EMAIL') {
      console.log(` ✓ PASS: Server prevented duplicate candidate registration with HTTP 409 Conflict`);
      console.log(`        Message: "${json.error.message}"`);
    } else {
      throw new Error(`Expected 409 DUPLICATE_EMAIL, got HTTP ${res.status}: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    console.error(` ✗ FAIL: Duplicate email protection check failed:`, err.message);
    failed = true;
  }

  // 5. Candidate Details & Audit Timeline (GET /api/candidates/:id)
  console.log('\n[5/7] Testing Candidate Details & Audit Timeline...');
  try {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}`);
    const json = await res.json();
    if (res.ok && json.success && json.data.id === candidateId) {
      console.log(` ✓ PASS: Retrieved candidate record with ${json.data.stageHistory.length} audit entries`);
    } else {
      throw new Error(`Failed to retrieve candidate: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    console.error(` ✗ FAIL: Details check failed:`, err.message);
    failed = true;
  }

  // 6. Stage Transition & Profile Edit (PATCH)
  console.log('\n[6/7] Testing Stage Transition & Profile Updates (PATCH)...');
  try {
    // Stage update
    const stageRes = await fetch(`${API_BASE}/candidates/${candidateId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage: 'Interview',
        note: 'Passed initial screening; advancing to technical interview round.',
        changedBy: 'Senior Recruiter',
      }),
    });
    const stageJson = await stageRes.json();
    if (stageRes.ok && stageJson.success && stageJson.data.currentStage === 'Interview') {
      console.log(` ✓ PASS: Stage promoted: Applied -> Interview`);
      console.log(`        New audit trail length: ${stageJson.data.stageHistory.length}`);
    } else {
      throw new Error(`Stage update failed: ${JSON.stringify(stageJson)}`);
    }

    // Profile edit
    const editRes = await fetch(`${API_BASE}/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appliedRole: 'Lead Full Stack Engineer',
        experience: 5,
      }),
    });
    const editJson = await editRes.json();
    if (editRes.ok && editJson.success && editJson.data.appliedRole === 'Lead Full Stack Engineer') {
      console.log(` ✓ PASS: Profile updated (Role: ${editJson.data.appliedRole}, Exp: ${editJson.data.experience})`);
    } else {
      throw new Error(`Profile edit failed: ${JSON.stringify(editJson)}`);
    }
  } catch (err) {
    console.error(` ✗ FAIL: Updates check failed:`, err.message);
    failed = true;
  }

  // 7. Query Filtering, Sorting & Deletion
  console.log('\n[7/7] Testing Query Filters, Pagination, and Deletion...');
  try {
    // Filter query
    const queryUrl = `${API_BASE}/candidates?search=Rivera&stage=Interview&sortBy=experience&sortOrder=desc`;
    const queryRes = await fetch(queryUrl);
    const queryJson = await queryRes.json();
    if (queryRes.ok && queryJson.success && queryJson.data.some(c => c.id === candidateId)) {
      console.log(` ✓ PASS: Search & stage filters matched candidate in database`);
      console.log(`        Matched records: ${queryJson.data.length} | Total candidates: ${queryJson.pagination.totalCandidates}`);
    } else {
      throw new Error(`Query filter failed: ${JSON.stringify(queryJson)}`);
    }

    // Delete candidate
    const delRes = await fetch(`${API_BASE}/candidates/${candidateId}`, { method: 'DELETE' });
    const delJson = await delRes.json();
    if (delRes.ok && delJson.success && delJson.data.id === candidateId) {
      console.log(` ✓ PASS: Candidate record deleted via DELETE /api/candidates/${candidateId}`);
    } else {
      throw new Error(`Delete failed: ${JSON.stringify(delJson)}`);
    }

    // Verify 404 after deletion
    const verifyDel = await fetch(`${API_BASE}/candidates/${candidateId}`);
    if (verifyDel.status === 404) {
      console.log(` ✓ PASS: Confirmed candidate ID is absent from database (HTTP 404)`);
    } else {
      throw new Error(`Expected HTTP 404 after deletion, got HTTP ${verifyDel.status}`);
    }
  } catch (err) {
    console.error(` ✗ FAIL: Query/deletion check failed:`, err.message);
    failed = true;
  }

  console.log('\n=========================================================');
  if (failed) {
    console.error('  E2E VERIFICATION FAILED WITH ERRORS                     ');
    console.log('=========================================================');
    process.exit(1);
  } else {
    console.log('  ALL PHASE 4 E2E LIVE SYSTEM CHECKS PASSED!             ');
    console.log('=========================================================');
  }
}

runVerification();
