# Mini ATS — Applicant Tracking System

> A production-quality Mini Applicant Tracking System built for a Full Stack Developer Intern assignment.  
> Manage candidates, track hiring pipelines, search/filter records, and view real-time recruitment metrics.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Getting Started (Local)](#getting-started-local)
6. [Environment Variables](#environment-variables)
7. [API Documentation](#api-documentation)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Screenshots](#screenshots)

---

## Features

### Candidate Management
- ✅ **Create candidates** — full form with validation (name, email, phone, role, experience, skills, source, resume URL, notes)
- ✅ **List candidates** — paginated table with search, stage filter, and sorting
- ✅ **View details** — complete candidate profile including full stage history audit trail
- ✅ **Edit candidates** — inline editing with form re-validation
- ✅ **Delete candidates** — two-step confirmation dialog before permanent deletion
- ✅ **Stage transitions** — move through pipeline with an optional recruiter note; every move is logged

### Pipeline & Stages
Six canonical hiring stages strictly enforced on both client and server:

| Stage | Description |
|---|---|
| `Applied` | Initial application received |
| `Screening` | Phone or resume screen |
| `Interview` | Technical / behavioral rounds |
| `Offer` | Job offer extended |
| `Hired` | Offer accepted, onboarded |
| `Rejected` | Declined at any stage |

### Dashboard Analytics
- Total candidates, active pipeline count, hired, and rejected metrics
- Stage-distribution bar chart (Recharts)
- Recent candidates list

### Search & Filtering
- Full-text search across name and email (ReDoS-safe)
- Filter by stage and applied role
- Sort by application date, name, or experience
- Server-side pagination with page navigation

### Reliability & Accessibility
- ARIA attributes (`aria-invalid`, `aria-describedby`, `role="alert"`)
- Keyboard navigation: `Escape` closes all modals and dialogs
- Duplicate email detection (HTTP 409) with in-form error display
- Invalid/malformed MongoDB IDs returned as HTTP 400
- Graceful empty states and network-error banners with retry actions
- Double-submit prevention (button disabled during in-flight mutations)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS |
| **Routing** | React Router v6 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express 4, TypeScript |
| **Database** | MongoDB + Mongoose 8 |
| **Validation** | Zod (shared schema approach) |
| **Security** | Helmet, CORS |
| **Logging** | Morgan |
| **Testing** | Vitest + @testing-library/react + Supertest |
| **Build** | tsc (server), Vite (client) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Browser (React SPA)                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Dashboard  │  │  Candidates  │  │ Candidate Detail│ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│          └────────────────┬────────────────┘            │
│                    ApiClient (fetch)                     │
│                    VITE_API_URL or /api proxy            │
└────────────────────────────┬─────────────────────────────┘
                             │  HTTPS
┌────────────────────────────▼─────────────────────────────┐
│  Express API (Node.js + TypeScript)                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ /health  │  │/candidates│  │ /analytics             │ │
│  └──────────┘  └──────────┘  └────────────────────────┘ │
│        Helmet │ CORS │ Morgan │ Zod validation           │
│        Centralized error handler + 400/404/409           │
└────────────────────────────┬─────────────────────────────┘
                             │  Mongoose ODM
┌────────────────────────────▼─────────────────────────────┐
│  MongoDB (Atlas M0 / local)                               │
│  Collection: candidates                                   │
│  Unique index on: email (normalized to lowercase)         │
└──────────────────────────────────────────────────────────┘
```

**Deployment targets (recommended)**

| Service | Purpose | Tier |
|---|---|---|
| [Vercel](https://vercel.com) | Frontend SPA | Free |
| [Render](https://render.com) | Backend API | Free |
| [MongoDB Atlas](https://cloud.mongodb.com) | Managed database | Free M0 |

---

## Project Structure

```
MINI ATS/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/               # Typed ApiClient + candidate service
│   │   ├── components/        # Reusable UI components (Input, Select, Badge, Dialog…)
│   │   ├── context/           # Toast notification context
│   │   ├── features/          # Candidate form, filters, stage selector
│   │   ├── hooks/             # useCandidates, useAnalytics
│   │   ├── pages/             # DashboardPage, CandidatesPage, CandidateDetailPage
│   │   └── types/             # Shared TypeScript interfaces
│   ├── tests/                 # Vitest + Testing Library test suites
│   ├── .env.example           # Client env var template
│   └── vercel.json            # SPA routing fallback for Vercel
│
├── server/                    # Express + TypeScript backend
│   ├── src/
│   │   ├── config/            # environment.ts (Zod-validated), database.ts
│   │   ├── constants/         # stages.ts (canonical stage enum)
│   │   ├── controllers/       # candidateController, analyticsController
│   │   ├── middleware/        # errorHandler, notFoundHandler, validateObjectId
│   │   ├── models/            # Candidate Mongoose model
│   │   ├── routes/            # candidate.routes, analytics.routes, health.routes
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── services/          # CandidateService (DB queries)
│   │   └── utils/             # seed.ts
│   ├── tests/                 # Vitest + Supertest API test suites
│   ├── .env.example           # Server env var template
│   └── API_DOCUMENTATION.md   # Complete REST API reference
│
├── render.yaml                # Render.com deployment blueprint
├── .gitignore                 # Excludes .env, dist/, node_modules/
├── eslint.config.js           # ESLint flat config
├── package.json               # Monorepo workspace root
└── README.md                  # This file
```

---

## Getting Started (Local)

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 20.x LTS |
| npm | 10.x |
| MongoDB | 6.x (local) or Atlas account |

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/mini-ats.git
cd mini-ats
```

### 2. Install all dependencies

```bash
npm install
```

This installs dependencies for both `client` and `server` workspaces.

### 3. Configure environment variables

**Server:**
```bash
cp server/.env.example server/.env
# Edit server/.env — set MONGODB_URI if not using local MongoDB
```

**Client:**
```bash
cp client/.env.example client/.env
# For local dev, VITE_API_URL can be left empty (Vite proxies /api → localhost:5000)
```

### 4. Start development servers

```bash
npm run dev
```

This starts both:
- **Backend API** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173`

Alternatively, start them separately:
```bash
npm run dev:server   # Backend only
npm run dev:client   # Frontend only
```

### 5. (Optional) Seed sample data

```bash
npm run seed
```

Populates the local `mini_ats` database with sample candidates across all pipeline stages.

### 6. Verify

- Frontend: `http://localhost:5173`
- Health endpoint: `http://localhost:5000/api/health`

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | HTTP server port |
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `MONGODB_URI` | **Yes** | `mongodb://127.0.0.1:27017/mini_ats` | MongoDB connection string |
| `MONGODB_TEST_URI` | No | `mongodb://127.0.0.1:27017/mini_ats_test_runner` | Isolated test database — used only by `npm run test` |
| `CLIENT_ORIGIN` | **Yes** | `http://localhost:5173` | Allowed CORS origin (frontend URL) |

**Production values to set in your hosting dashboard (never commit):**
- `MONGODB_URI` → MongoDB Atlas connection string  
  Format: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mini_ats?retryWrites=true&w=majority`
- `CLIENT_ORIGIN` → Your deployed Vercel URL (e.g. `https://mini-ats.vercel.app`)

### Client (`client/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `""` (empty) | Backend API base URL |

- **Local dev**: Leave empty — Vite's `server.proxy` forwards `/api` → `http://localhost:5000`
- **Production (Vercel)**: Set to your Render backend URL:  
  `VITE_API_URL=https://mini-ats-api.onrender.com/api`

> **Security**: `.env` files are listed in `.gitignore`. They will never be committed to GitHub.

---

## API Documentation

Full REST API reference is available in [`server/API_DOCUMENTATION.md`](server/API_DOCUMENTATION.md).

### Quick reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health + DB status |
| `POST` | `/api/candidates` | Create a candidate |
| `GET` | `/api/candidates` | List candidates (paginated, searchable, filterable) |
| `GET` | `/api/candidates/:id` | Get single candidate + stage history |
| `PATCH` | `/api/candidates/:id` | Update candidate fields |
| `PATCH` | `/api/candidates/:id/stage` | Transition pipeline stage |
| `DELETE` | `/api/candidates/:id` | Delete a candidate |
| `GET` | `/api/analytics` | Dashboard metrics aggregation |

### Key query parameters for `GET /api/candidates`

```
?search=john          # name/email search (ReDoS-safe)
?stage=Interview      # filter by canonical stage
?role=Frontend        # filter by role substring
?page=2&limit=10      # pagination
?sortBy=experience&sortOrder=asc
```

---

## Testing

### Run all tests

```bash
npm run test
```

**Total: 66 tests passing** (36 server + 30 client)

### Server tests (36 tests)

```bash
npm run test:server
```

| File | Tests | Covers |
|---|---|---|
| `candidates.test.ts` | 17 | Full CRUD, filtering, pagination, sorting |
| `reliability.test.ts` | 14 | Malformed IDs, 404s, duplicate email, invalid inputs, all 6 stage transitions, ReDoS defense |
| `analytics.test.ts` | 3 | Aggregation correctness, empty DB |
| `health.test.ts` | 2 | DB connectivity, HTTP 200 |

### Client tests (30 tests)

```bash
npm run test:client
```

| File | Tests | Covers |
|---|---|---|
| `CandidateWorkflows.test.tsx` | 12 | CRUD flows, stage changes, 409 conflict |
| `AnalyticsDashboard.test.tsx` | 6 | Metrics cards, charts, recent list |
| `AccessibilityAndReliability.test.tsx` | 6 | ARIA attributes, double-submit, Escape key, 404 recovery |
| `App.test.tsx` | 4 | Navigation, responsive layout |

### Other checks

```bash
npm run typecheck   # TypeScript — 0 errors
npm run lint        # ESLint — 0 errors, 0 warnings
npm run build       # Production build — exit code 0
```

---

## Deployment

### Overview

| Service | What | Free Tier |
|---|---|---|
| **MongoDB Atlas** | Database | M0 (512 MB) |
| **Render** | Backend API (Node.js) | 750 h/month (sleeps after 15 min) |
| **Vercel** | Frontend SPA | Unlimited |

---

### Step 1: MongoDB Atlas

1. Create an account at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a **free M0 cluster** in your preferred region.
3. Under **Database Access**: create a user with a strong password.
4. Under **Network Access**: add `0.0.0.0/0` (allow all IPs — required for Render's dynamic IPs).
5. Click **Connect → Connect your application** and copy the connection string:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mini_ats?retryWrites=true&w=majority
   ```
   Replace `<password>` with your database user password.

---

### Step 2: Render (Backend API)

1. Push this repository to GitHub.
2. Log in to [render.com](https://render.com) and click **New → Web Service**.
3. Connect your GitHub repository.
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`
5. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | *(your Atlas connection string — paste here, do NOT commit)* |
   | `CLIENT_ORIGIN` | *(your Vercel URL — add after Step 3, e.g. `https://mini-ats.vercel.app`)* |

6. Click **Create Web Service**. Render will build and deploy the backend.
7. Note your Render service URL, e.g. `https://mini-ats-api.onrender.com`.
8. Test: `curl https://mini-ats-api.onrender.com/api/health`

> **Note**: On the free Render tier, the service sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds while the service wakes up. This is acceptable for an assignment/demo.

---

### Step 3: Vercel (Frontend)

1. Log in to [vercel.com](https://vercel.com) and click **Add New → Project**.
2. Import your GitHub repository.
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://mini-ats-api.onrender.com/api` *(your Render URL)* |

5. Click **Deploy**. Vercel builds and publishes the SPA.
6. Note your Vercel URL, e.g. `https://mini-ats.vercel.app`.

---

### Step 4: Wire CORS

Go back to your **Render dashboard → Environment Variables** and update:
```
CLIENT_ORIGIN = https://mini-ats.vercel.app
```
Trigger a redeploy on Render for the change to take effect.

---

### Step 5: Verify the Live Deployment

Run through this verification checklist on the live URLs:

- [ ] `GET <render-url>/api/health` → JSON `{ status: "healthy", database: { state: "connected" } }`
- [ ] Frontend loads at `<vercel-url>` without console errors
- [ ] Dashboard displays live metrics (not zeros)
- [ ] Create a candidate → appears in the table immediately
- [ ] Edit a candidate → changes persist on page reload
- [ ] Search by name → filters results correctly
- [ ] Change a candidate's stage → stage history reflects the move
- [ ] Delete a candidate → removed from list; dashboard updates
- [ ] Deep link to `<vercel-url>/candidates/<id>` → loads correctly (no 404)
- [ ] No secrets visible in the browser's network inspector or page source

---

### Secret Management Checklist

Before pushing to GitHub, verify:

```bash
git status                       # .env files should NOT appear
git grep -r "MONGODB_URI"        # should only appear in .env.example
git grep -r "mongodb+srv"        # should return nothing
```

The `.gitignore` at the root already excludes:
```
.env
.env.local
.env.*.local
```

All secrets are configured exclusively through hosting platform dashboards (Render, Vercel) and are never stored in the repository.

---

## Screenshots

> Screenshots captured from the live local development server (Phase 5 verification, Oct 2026).

### Dashboard
Shows total candidates, active pipeline count, hired/rejected metrics, stage-distribution bar chart, and recent candidates.

### Candidates List
Paginated table with search bar, stage filter dropdown, and Add Candidate button.

### Candidate Detail
Full profile with stage history audit trail and inline stage transition control.

### Add / Edit Candidate
Modal form with real-time Zod validation, inline error messages connected via ARIA attributes, and duplicate-email detection.

---

## License

MIT — built as a Full Stack Developer Intern assignment demonstration.
