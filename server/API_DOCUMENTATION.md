# Mini ATS — REST API Documentation

This document describes the REST API endpoints for the **Mini Applicant Tracking System (ATS)** backend, including schemas, query parameters, validation rules, and sample JSON payloads.

**Base URL:** `http://localhost:5000/api`

---

## 1. Standard Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Optional human-readable confirmation message",
  "data": { ... },
  "pagination": { ... } // Present on paginated list endpoints
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message",
    "code": "ERROR_CODE",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  }
}
```

---

## 2. Canonical Stages

The system strictly enforces the following **6 canonical hiring stages**:

- `Applied` — Initial stage upon candidate application.
- `Screening` — Recruiter phone or resume screening.
- `Interview` — Technical or behavioral interview rounds.
- `Offer` — Formal job offer extended.
- `Hired` — Offer accepted and candidate onboarded.
- `Rejected` — Candidate declined or rejected at any stage.

---

## 3. Endpoints Reference

### A. System Health Check

#### `GET /health`

Returns system uptime, environment, Node version, and MongoDB connection status.

- **Status Code:** `200 OK`
- **Response Example:**

```json
{
  "success": true,
  "message": "Mini ATS API is running smoothly",
  "data": {
    "status": "healthy",
    "service": "mini-ats-server",
    "version": "1.0.0",
    "uptimeSeconds": 792,
    "timestamp": "2026-10-18T05:24:56.003Z",
    "environment": "development",
    "nodeVersion": "v24.21.0",
    "database": {
      "state": "connected",
      "host": "127.0.0.1",
      "name": "mini_ats"
    }
  }
}
```

---

### B. Candidate Management

#### `POST /candidates`

Creates a new candidate record in the ATS. Automatically normalizes email to lowercase, checks for duplicate email conflict, and initializes the first entry in `stageHistory`.

- **Request Body (JSON):**

```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@example.com",
  "phone": "+91 98765 43210",
  "appliedRole": "Full Stack Developer",
  "experience": 3,
  "skills": ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
  "source": "LinkedIn",
  "currentStage": "Applied",
  "resumeUrl": "https://example.com/resumes/aarav.pdf",
  "notes": "Strong candidate with full-stack capabilities."
}
```

- **Validation Rules:**
  - `name`: String, 2–100 characters (required)
  - `email`: Valid email format, unique in database (required)
  - `phone`: String, 3–30 characters (required)
  - `appliedRole`: String, 2–100 characters (required)
  - `experience`: Number, 0–50 years (required)
  - `skills`: Array of strings or comma-separated string, at least 1 skill required
  - `source`: String, 2–100 characters (required)
  - `currentStage`: One of the 6 canonical stages (default: `"Applied"`)
  - `resumeUrl`: Optional valid URL
  - `notes`: Optional string, max 2000 characters

- **Status Codes:**
  - `201 Created`: Candidate successfully created.
  - `400 Bad Request`: Validation failure on required fields.
  - `409 Conflict`: Candidate with this email already exists (`code: "DUPLICATE_EMAIL"`).

- **Response Example:**

```json
{
  "success": true,
  "message": "Candidate created successfully",
  "data": {
    "id": "6ad45bdbc2d98690482d3f34",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "phone": "+91 98765 43210",
    "appliedRole": "Full Stack Developer",
    "experience": 3,
    "skills": ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
    "source": "LinkedIn",
    "currentStage": "Applied",
    "applicationDate": "2026-10-18T05:40:43.428Z",
    "resumeUrl": "https://example.com/resumes/aarav.pdf",
    "notes": "Strong candidate with full-stack capabilities.",
    "stageHistory": [
      {
        "fromStage": null,
        "toStage": "Applied",
        "changedAt": "2026-10-18T05:40:43.428Z",
        "note": "Strong candidate with full-stack capabilities.",
        "changedBy": "Recruiter"
      }
    ],
    "createdAt": "2026-10-18T05:40:43.437Z",
    "updatedAt": "2026-10-18T05:40:43.437Z"
  }
}
```

---

#### `GET /candidates`

Lists candidate records with server-side pagination, text search, stage filtering, role filtering, experience filtering, and sorting.

- **Query Parameters:**
  - `page`: Integer >= 1 (default: `1`)
  - `limit`: Integer between 1 and 100 (default: `10`)
  - `search` / `q`: Case-insensitive regex search against candidate name and email
  - `stage`: Filter by canonical stage (`Applied`, `Screening`, `Interview`, `Offer`, `Hired`, `Rejected`)
  - `role`: Filter by applied role (case-insensitive substring)
  - `minExp`: Minimum years of experience (number >= 0)
  - `maxExp`: Maximum years of experience (number >= 0)
  - `sortBy`: Field to sort by (`applicationDate`, `name`, `experience`, `createdAt`) (default: `applicationDate`)
  - `sortOrder`: Sort direction (`asc` or `desc`) (default: `desc`)

- **Status Codes:**
  - `200 OK`: Successful query execution.
  - `400 Bad Request`: Invalid query parameter types.

- **Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "id": "6ad45bdbc2d98690482d3f34",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "phone": "+91 98765 43210",
      "appliedRole": "Full Stack Developer",
      "experience": 3,
      "skills": ["React", "TypeScript", "Node.js"],
      "source": "LinkedIn",
      "currentStage": "Applied",
      "applicationDate": "2026-10-18T05:40:43.428Z",
      "stageHistory": [ ... ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCandidates": 13,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### `GET /candidates/:id`

Retrieves a single candidate record by MongoDB ObjectId, including the complete stage history audit trail.

- **URL Parameters:**
  - `id`: 24-character hexadecimal MongoDB ObjectId

- **Status Codes:**
  - `200 OK`: Candidate found.
  - `400 Bad Request`: Malformed ObjectId format.
  - `404 Not Found`: No candidate with this ID exists.

---

#### `PATCH /candidates/:id`

Updates general candidate details (name, phone, role, experience, skills, source, resumeUrl, notes). Performs email uniqueness check if changing email address.

- **Request Body (JSON):** Partial candidate fields (at least one field required).

```json
{
  "experience": 4,
  "notes": "Updated candidate experience following evaluation."
}
```

- **Status Codes:**
  - `200 OK`: Candidate updated.
  - `400 Bad Request`: Validation failure on input fields.
  - `404 Not Found`: Candidate not found.
  - `409 Conflict`: Desired email is already claimed by another candidate.

---

#### `PATCH /candidates/:id/stage`

Transitions a candidate to a new canonical stage. Automatically records the transition event in `stageHistory` with previous stage, target stage, timestamp, recruiter note, and author.

- **Request Body (JSON):**

```json
{
  "stage": "Interview",
  "note": "Passed phone screen with flying colors; scheduled for system design interview.",
  "changedBy": "Senior Tech Recruiter"
}
```

- **Validation Rules:**
  - `stage`: Required, must be one of `Applied`, `Screening`, `Interview`, `Offer`, `Hired`, `Rejected`.
  - `note`: Optional string, max 1000 characters.
  - `changedBy`: Optional string, max 100 characters (default: `"Recruiter"`).

- **Status Codes:**
  - `200 OK`: Stage transitioned successfully.
  - `400 Bad Request`: Invalid or non-canonical stage provided.
  - `404 Not Found`: Candidate not found.

---

#### `DELETE /candidates/:id`

Permanently deletes a candidate record from the active database.

- **URL Parameters:**
  - `id`: 24-character hexadecimal MongoDB ObjectId

- **Status Codes:**
  - `200 OK`: Candidate deleted.
  - `400 Bad Request`: Invalid ID format.
  - `404 Not Found`: Candidate not found.

- **Response Example:**

```json
{
  "success": true,
  "message": "Candidate 'Aarav Sharma' deleted successfully",
  "data": {
    "id": "6ad45bdbc2d98690482d3f34"
  }
}
```
