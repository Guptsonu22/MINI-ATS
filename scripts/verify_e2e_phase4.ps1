# Phase 4 Full End-to-End Candidate Lifecycle Verification Script
$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  MINI ATS — PHASE 4 END-TO-END VERIFICATION SUITE       " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Health & Server Connectivity
Write-Host "`n[1/7] Testing Health Check & DB Connectivity..." -ForegroundColor Yellow
$healthRes = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
if ($healthRes.success -and $healthRes.data.database.state -eq "connected") {
    Write-Host " PASS: Express API is healthy & connected to MongoDB ($($healthRes.data.database.name))" -ForegroundColor Green
} else {
    throw "FAIL: Backend health check failed: $($healthRes | ConvertTo-Json)"
}

# 2. Vite Dev Server Connectivity
Write-Host "`n[2/7] Testing Frontend Server Connectivity..." -ForegroundColor Yellow
$viteRes = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -UseBasicParsing
if ($viteRes.StatusCode -eq 200) {
    Write-Host " PASS: Vite React Frontend is serving on http://localhost:5173 (HTTP 200)" -ForegroundColor Green
} else {
    throw "FAIL: Vite frontend returned status code $($viteRes.StatusCode)"
}

# 3. Create Candidate (POST /api/candidates)
Write-Host "`n[3/7] Testing Candidate Creation (POST /api/candidates)..." -ForegroundColor Yellow
$uniqueEmail = "alex.rivera.e2e." + (Get-Date -Format "yyyyMMddHHmmss") + "@example.com"
$newCandidateBody = @{
    name = "Alex Rivera"
    email = $uniqueEmail
    phone = "+1 555-234-5678"
    appliedRole = "Full Stack Developer"
    experience = 4
    source = "LinkedIn"
    skills = @("React", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS")
    currentStage = "Applied"
    resumeUrl = "https://example.com/resumes/alex_rivera.pdf"
    notes = "Exceptional system design and full-stack architecture background."
} | ConvertTo-Json

$createRes = Invoke-RestMethod -Uri "http://localhost:5000/api/candidates" -Method Post -Body $newCandidateBody -ContentType "application/json"
if ($createRes.success -and $createRes.data.id) {
    $candidateId = $createRes.data.id
    Write-Host " PASS: Candidate created with ID: $candidateId" -ForegroundColor Green
    Write-Host "       Name: $($createRes.data.name), Email: $($createRes.data.email), Stage: $($createRes.data.currentStage)" -ForegroundColor Gray
} else {
    throw "FAIL: Candidate creation failed: $($createRes | ConvertTo-Json)"
}

# 4. Duplicate Email Protection (POST duplicate email)
Write-Host "`n[4/7] Testing Duplicate Email Protection (Conflict 409)..." -ForegroundColor Yellow
try {
    $dupRes = Invoke-RestMethod -Uri "http://localhost:5000/api/candidates" -Method Post -Body $newCandidateBody -ContentType "application/json"
    throw "FAIL: Expected 409 Conflict error on duplicate email, but request succeeded!"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host " PASS: Server correctly rejected duplicate email with HTTP 409 Conflict" -ForegroundColor Green
    } else {
        throw "FAIL: Unexpected error on duplicate email: $_"
    }
}

# 5. Get Candidate Details (GET /api/candidates/:id) & Stage History
Write-Host "`n[5/7] Testing Candidate Details & Audit Timeline (GET /api/candidates/:id)..." -ForegroundColor Yellow
$getRes = Invoke-RestMethod -Uri "http://localhost:5000/api/candidates/$candidateId" -Method Get
if ($getRes.success -and $getRes.data.id -eq $candidateId -and $getRes.data.stageHistory.Count -ge 1) {
    Write-Host " PASS: Candidate record fetched successfully with $($getRes.data.stageHistory.Count) stage history entries" -ForegroundColor Green
} else {
    throw "FAIL: Failed to fetch candidate details or missing stageHistory"
}

# 6. Update Stage & Edit Profile (PATCH /api/candidates/:id/stage & PATCH /api/candidates/:id)
Write-Host "`n[6/7] Testing Stage Promotion & Profile Updates (PATCH)..." -ForegroundColor Yellow
# Update Stage: Applied -> Interview
$stageBody = @{
    stage = "Interview"
    note = "Cleared screening phone call. Advancing to technical interview."
    changedBy = "E2E Test Runner"
} | ConvertTo-Json

$stageRes = Invoke-RestMethod -Uri "http://localhost:5000/api/candidates/$candidateId/stage" -Method Patch -Body $stageBody -ContentType "application/json"
if ($stageRes.success -and $stageRes.data.currentStage -eq "Interview" -and $stageRes.data.stageHistory.Count -eq 2) {
    Write-Host " PASS: Stage promoted to 'Interview' with audit entry recorded" -ForegroundColor Green
} else {
    throw "FAIL: Stage update failed: $($stageRes | ConvertTo-Json)"
}

# Update Profile: change role & experience
$editBody = @{
    appliedRole = "Senior Full Stack Engineer"
    experience = 5
    notes = "Updated notes after technical round."
} | ConvertTo-Json

$editRes = Invoke-RestMethod -Uri "http://localhost:5000/api/candidates/$candidateId" -Method Patch -Body $editBody -ContentType "application/json"
if ($editRes.success -and $editRes.data.appliedRole -eq "Senior Full Stack Engineer" -and $editRes.data.experience -eq 5) {
    Write-Host " PASS: Profile successfully updated (Role: Senior Full Stack Engineer, Exp: 5)" -ForegroundColor Green
} else {
    throw "FAIL: Profile update failed: $($editRes | ConvertTo-Json)"
}

# 7. Query, Filter, Sorting & Delete (GET /api/candidates & DELETE /api/candidates/:id)
Write-Host "`n[7/7] Testing Query Filters, Sorting, and Deletion..." -ForegroundColor Yellow

# Query with search & stage filter
$queryRes = Invoke-RestMethod -Uri "http://localhost:5000/api/candidates?search=Rivera&stage=Interview&sortBy=experience&sortOrder=desc" -Method Get
if ($queryRes.success -and $queryRes.data.Count -ge 1 -and $queryRes.data[0].id -eq $candidateId) {
    Write-Host " PASS: Search & stage query filter successfully matched created candidate ($($queryRes.pagination.totalCandidates) total found)" -ForegroundColor Green
} else {
    throw "FAIL: Search query did not match created candidate: $($queryRes | ConvertTo-Json)"
}

# Delete candidate
$deleteRes = Invoke-RestMethod -Uri "http://localhost:5000/api/candidates/$candidateId" -Method Delete
if ($deleteRes.success -and $deleteRes.data.id -eq $candidateId) {
    Write-Host " PASS: Candidate record deleted via DELETE /api/candidates/$candidateId" -ForegroundColor Green
} else {
    throw "FAIL: Delete candidate request failed: $($deleteRes | ConvertTo-Json)"
}

# Verify candidate no longer exists (404)
try {
    $checkDeleted = Invoke-RestMethod -Uri "http://localhost:5000/api/candidates/$candidateId" -Method Get
    throw "FAIL: Candidate still exists after deletion!"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host " PASS: Verified candidate ID no longer exists in database (HTTP 404)" -ForegroundColor Green
    } else {
        throw "FAIL: Expected HTTP 404 but got $_"
    }
}

Write-Host "`n=========================================================" -ForegroundColor Cyan
Write-Host "  ALL PHASE 4 END-TO-END VERIFICATION CHECKS PASSED!     " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
