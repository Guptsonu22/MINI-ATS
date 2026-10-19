# Mini ATS — Applicant Tracking System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_M0-47A248.svg?logo=mongodb)](https://cloud.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-66%2F66%20Passed-success.svg?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A modern, full-stack **Applicant Tracking System (ATS)** built for recruitment workflows. Manage candidate lifecycles, monitor interactive pipeline stages, search and filter candidate profiles, and visualize real-time recruitment metrics through an analytics dashboard.

---

## 📑 Table of Contents

1. [Live Demonstration & Repository](#-live-demonstration--repository)
2. [Key Features](#-key-features)
3. [Canonical Hiring Pipeline](#-canonical-hiring-pipeline)
4. [System Architecture](#-system-architecture)
5. [Tech Stack](#-tech-stack)
6. [Project Structure](#-project-structure)
7. [Getting Started (Local Development)](#-getting-started-local-development)
8. [Environment Variables](#-environment-variables)
9. [REST API Reference](#-rest-api-reference)
10. [Automated Testing Suite](#-automated-testing-suite)
11. [Production Deployment Guide](#-production-deployment-guide)
12. [Security & Production Hardening](#-security--production-hardening)
13. [2–3 Minute Evaluator Demo Script](#-23-minute-evaluator-demo-script)
14. [License](#-license)

---

## 🌐 Live Demonstration & Repository

| Resource                    | Link                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| **Live Web App (Vercel)**   | [https://mini-ats-alpha.vercel.app](https://mini-ats-alpha.vercel.app)   |
| **Backend Health Endpoint** | [https://mini-ats-60bk.onrender.com/api/health](https://mini-ats-60bk.onrender.com/api/health) |
| **GitHub Repository**       | [https://github.com/Guptsonu22/MINI-ATS](https://github.com/Guptsonu22/MINI-ATS) |
| **Video Walkthrough Demo**  | *(add Loom or YouTube link)*                                             |

---

## ✨ Key Features

### 👥 1. Candidate Lifecycle Management

- **Create Candidates**: Complete registration with real-time Zod validation (Full Name, normalized Email, Phone, Applied Role, Years of Experience, Skills Tags, Source, Resume URL, and Recruiter Notes).
- **Duplicate Email Protection**: Automatic detection of existing emails with HTTP 409 conflict responses and inline error highlights.
- **Candidate Profile & History**: Dedicated candidate page displaying complete profile details and an immutable **Stage History Audit Trail** logging every transition with timestamps, recruiter notes, and stage names.
- **Edit Records**: Update candidate details with inline validation to prevent invalid data from reaching the database.
- **Safe Deletion**: Two-step interactive confirmation dialog (`ConfirmDialog`) preventing accidental deletions.

### 📋 2. Interactive Pipeline & Directory

- **Candidate Directory**: Paginated, sortable directory table with instant visual status badges for all stages.
- **Hiring Pipeline Kanban**: Visual pipeline board grouping candidates by canonical stage with one-click stage progressions and candidate counts per column.
- **Full-Text Search**: Case-insensitive text search matching candidate names or emails, protected by regex escaping to eliminate ReDoS vulnerabilities.
- **Multi-Criteria Filtering**: Filter by hiring stage, applied role, and experience range.
- **Dynamic Sorting**: Sort candidates ascending or descending by Application Date, Candidate Name, or Years of Experience.
- **Server-Side Pagination**: Efficient pagination controls with custom page size limits and page jump navigation.

### 📊 3. Real-Time Recruitment Analytics

- **Live Aggregated Metrics**: Metric cards for **Total Candidates**, **Active Pipeline**, **Offers & Hired**, and **Rejected** derived directly from MongoDB aggregation queries.
- **Stage Distribution Chart**: Interactive Recharts bar chart showing candidate counts across all 6 stages with responsive tooltips and dynamic color mapping.
- **Recent Candidates List**: Dashboard table of recent applicants with direct navigation links.
- **Automatic Refresh**: Dashboard metrics synchronize dynamically whenever candidates are added, edited, moved, or deleted.

### 🛡️ 4. Enterprise-Grade UX & Reliability

- **Toast Notification System**: Instant feedback for successful mutations, validation errors, and network alerts.
- **Loading Skeletons**: Tailored skeleton screens for metric cards, data tables, and candidate profile cards during network requests.
- **Resilient Error Recovery**: Descriptive error banners with a one-click **Try Again** retry handler when API requests fail.
- **Keyboard Navigation & Accessibility**: Full `Escape` key listener to dismiss all modals, drawers, and confirmation dialogs. Complete ARIA descriptors (`aria-invalid`, `aria-describedby`, `role="alert"`).
- **Double-Submit Prevention**: Mutation buttons automatically disable and display loading spinners during in-flight network requests.

---

## 🎯 Canonical Hiring Pipeline

The Mini ATS strictly enforces **6 canonical hiring stages** across frontend components, TypeScript types, Mongoose models, and backend Zod validation schemas:

```
[ Applied ] ──► [ Screening ] ──► [ Interview ] ──► [ Offer ] ──► [ Hired ]
     │               │                 │               │
     └───────────────┴─────────────────┴───────────────┴────────► [ Rejected ]
```

| Stage       | Purpose                                                      |  Pipeline Category  |
| ----------- | ------------------------------------------------------------ | :-----------------: |
| `Applied`   | Initial candidate submission received                        |   Active Pipeline   |
| `Screening` | Recruiter resume or introductory phone screening             |   Active Pipeline   |
| `Interview` | Technical interview, coding assessment, or managerial rounds |   Active Pipeline   |
| `Offer`     | Formal job offer extended                                    |   Active Pipeline   |
| `Hired`     | Candidate accepted offer and successfully onboarded          | Terminal (Positive) |
| `Rejected`  | Candidate declined, disqualified, or application closed      | Terminal (Negative) |

> **Active Candidates Definition**: Candidates in `Applied`, `Screening`, `Interview`, or `Offer`. Candidates who are `Hired` or `Rejected` are categorized as completed outcomes and excluded from active counts.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BROWSER (React 18 SPA)                          │
│                                                                        │
│   ┌────────────────┐   ┌─────────────────┐   ┌─────────────────────┐   │
│   │ Dashboard Page │   │ Candidates Page │   │ Candidate Detail    │   │
│   │ (Metrics/Chart)│   │ (Table/Search)  │   │ (Audit Trail/Notes) │   │
│   └────────────────┘   └─────────────────┘   └─────────────────────┘   │
│           │                     │                       │              │
│           └─────────────────────┼───────────────────────┘              │
│                                 ▼                                      │
│                     Typed ApiClient (Fetch API)                        │
│                 Configured via VITE_API_URL or Proxy                   │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTPS Requests
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js + Express)                     │
│                                                                        │
│     Helmet Security Headers │ CORS Origin Policy │ Morgan Logger       │
│     1MB Request Body Limits │ Express Router                           │
│                                                                        │
│   ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  │
│   │  Health Router    │  │ Candidates Router │  │ Analytics Router  │  │
│   │  GET /api/health  │  │ CRUD & Stages     │  │ Aggregation API   │  │
│   └───────────────────┘  └───────────────────┘  └───────────────────┘  │
│             │                      │                      │            │
│             └──────────────────────┼──────────────────────┘            │
│                                    ▼                                   │
│                        Zod Validation Middleware                       │
│                        Centralized Error Handler                       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Mongoose ODM 8.x (TLS/SRV)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas M0 Cluster)                  │
│                                                                        │
│   Collection: candidates                                               │
│   Indexes:                                                             │
│   - email (Unique, Case-Insensitive)                                   │
│   - currentStage (Indexed for stage queries)                           │
│   - applicationDate (Indexed for temporal sorting)                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

| Domain                 | Technology             |     Version     | Purpose                                                    |
| ---------------------- | ---------------------- | :-------------: | ---------------------------------------------------------- |
| **Frontend Framework** | React                  |    `18.3.1`     | Component-based reactive user interface                    |
| **Language**           | TypeScript             |     `5.6.3`     | End-to-end type safety on client and server                |
| **Bundler & Tooling**  | Vite                   |    `5.4.21`     | Lightning-fast development server & production builds      |
| **Styling**            | Tailwind CSS           |    `3.4.14`     | Modern utility-first responsive layout & design system     |
| **Routing**            | React Router DOM       |    `6.27.0`     | Client-side routing with nested routes & 404 fallbacks     |
| **Form Handling**      | React Hook Form + Zod  | `7.53` / `3.23` | Schema-driven form validation with accessible error states |
| **Data Visualization** | Recharts               |    `2.13.0`     | Dynamic responsive SVG bar charts for stage distribution   |
| **Icons**              | Lucide React           |    `0.453.0`    | Modern UI icon set                                         |
| **Backend Runtime**    | Node.js                |  `20.x / 22.x`  | Scalable JavaScript server runtime                         |
| **API Framework**      | Express                |    `4.21.1`     | REST API routing and middleware framework                  |
| **Database**           | MongoDB Atlas          |    `M0 Free`    | Cloud document database with TLS encryption                |
| **ODM**                | Mongoose               |     `8.7.2`     | Schema modeling, casting, and aggregation queries          |
| **Security**           | Helmet & CORS          |  `8.0` / `2.8`  | HTTP security headers and configurable CORS origins        |
| **Testing**            | Vitest & Supertest     | `2.1.3` / `7.0` | Unit, integration, workflow, and API reliability testing   |
| **Testing Library**    | @testing-library/react |    `16.0.1`     | Accessibility and DOM testing                              |

---

## 📁 Project Structure

```
MINI ATS/
├── client/                               # Frontend Workspace (React + Vite)
│   ├── src/
│   │   ├── api/                          # Typed API Client and candidate service
│   │   │   ├── client.ts                 # Base fetch wrapper with error handling
│   │   │   └── candidates.api.ts         # Candidate CRUD & analytics API methods
│   │   ├── components/                   # Shared reusable UI primitives
│   │   │   ├── layout/                   # Navbar, Sidebar, AppLayout, MobileDrawer
│   │   │   └── ui/                       # Button, Input, Select, Badge, Skeleton, ConfirmDialog
│   │   ├── context/                      # Toast notification context
│   │   ├── features/candidates/          # Candidate forms, filters, tables, and cards
│   │   ├── pages/                        # DashboardPage, CandidatesPage, CandidateDetailPage, PipelinePage
│   │   └── types/                        # Core TypeScript domain models & API response interfaces
│   ├── tests/                            # Client test suites (Vitest + Testing Library)
│   ├── .env.example                      # Client environment template
│   ├── vercel.json                       # Vercel SPA route rewrite configuration
│   └── vite.config.ts                    # Vite config with /api local proxy
│
├── server/                               # Backend Workspace (Express + Mongoose)
│   ├── src/
│   │   ├── config/                       # database.ts (Mongoose) & environment.ts (Zod parsed)
│   │   ├── constants/                    # Canonical stages array and types
│   │   ├── controllers/                  # candidate.controller, analytics.controller, health.controller
│   │   ├── middleware/                   # errorHandler, notFoundHandler, validate middleware
│   │   ├── models/                       # candidate.model.ts (Mongoose Schema with indexes)
│   │   ├── routes/                       # Express router definitions
│   │   ├── schemas/                      # Zod validation schemas for all inputs & queries
│   │   ├── services/                     # Business logic & MongoDB aggregation services
│   │   └── utils/                        # seed.ts (Mock data generator with production guards)
│   ├── tests/                            # Backend API test suites (Supertest + Vitest)
│   ├── .env.example                      # Server environment template
│   └── API_DOCUMENTATION.md              # Detailed API payload reference
│
├── render.yaml                           # Render.com backend deployment blueprint
├── eslint.config.js                      # Flat ESLint configuration
├── package.json                          # Monorepo root with npm workspaces
└── README.md                             # Comprehensive project documentation
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or free MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/Guptsonu22/MINI-ATS.git
cd MINI-ATS
```

### 2. Install Dependencies

Install all root, client, and server dependencies in one command:

```bash
npm install
```

### 3. Configure Environment Variables

**Backend (`server/.env`):**

```bash
cp server/.env.example server/.env
```

Open `server/.env` and ensure `MONGODB_URI` points to your local MongoDB or Atlas cluster:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/mini_ats
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/mini_ats_test_runner
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend (`client/.env`):**

```bash
cp client/.env.example client/.env
```

_(For local development, `VITE_API_URL` can remain empty; Vite's dev server automatically proxies `/api` requests to `http://localhost:5000`)._

### 4. Seed Initial Data (Optional but Recommended)

Seed the database with 12 candidates across all 6 stages:

```bash
npm run seed
```

### 5. Launch the Application

Start both the backend server and frontend development client concurrently:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

_(To run services independently: `npm run dev:server` or `npm run dev:client`)_

---

## ⚙️ Environment Variables

### Server (`server/.env`)

| Variable           |  Type  | Default                 | Description                                                         |
| ------------------ | :----: | ----------------------- | ------------------------------------------------------------------- |
| `PORT`             | Number | `5000`                  | Port for Express HTTP server (`10000` on Render)                    |
| `NODE_ENV`         | String | `development`           | Runtime environment: `development`, `production`, `test`            |
| `MONGODB_URI`      | String | _Required_              | MongoDB connection string (Local or MongoDB Atlas)                  |
| `MONGODB_TEST_URI` | String | _Auto_                  | Isolated database for test runner (must contain `test`)             |
| `CLIENT_ORIGIN`    | String | `http://localhost:5173` | Allowed CORS origin (Vercel production URL or comma-separated list) |

### Client (`client/.env`)

| Variable       |  Type  | Default      | Description                                                                         |
| -------------- | :----: | ------------ | ----------------------------------------------------------------------------------- |
| `VITE_API_URL` | String | `""` (empty) | Public backend API URL (e.g. `https://<render-app>.onrender.com/api` in production) |

> 🔒 **Security Notice**: `.env` files are strictly excluded via `.gitignore` and are never committed to version control. Production environment variables are set directly in the cloud provider's secure dashboard.

---

## 📡 REST API Reference

Full payload structures, schemas, and example JSON responses are documented in [`server/API_DOCUMENTATION.md`](server/API_DOCUMENTATION.md).

### Endpoint Summary

| Method   | Endpoint                    | Description                                             |        Status Codes        |
| -------- | --------------------------- | ------------------------------------------------------- | :------------------------: |
| `GET`    | `/api/health`               | Health status and MongoDB connection verification       |        `200`, `503`        |
| `GET`    | `/api/candidates`           | List candidates with pagination, search, filters & sort |        `200`, `400`        |
| `POST`   | `/api/candidates`           | Create a new candidate profile                          |    `201`, `400`, `409`     |
| `GET`    | `/api/candidates/:id`       | Get single candidate with stage audit history           |    `200`, `400`, `404`     |
| `PATCH`  | `/api/candidates/:id`       | Update candidate profile details                        | `200`, `400`, `404`, `409` |
| `PATCH`  | `/api/candidates/:id/stage` | Transition candidate to a new hiring stage with notes   |    `200`, `400`, `404`     |
| `DELETE` | `/api/candidates/:id`       | Permanently remove candidate record                     |    `200`, `400`, `404`     |
| `GET`    | `/api/analytics`            | Recruitment metrics, counts, and stage distribution     |           `200`            |

### Query Parameters for `GET /api/candidates`

```
GET /api/candidates?search=Ishaan&stage=Interview&role=Full+Stack&page=1&limit=10&sortBy=experience&sortOrder=desc
```

- `search` / `q`: Case-insensitive search on candidate name or email (ReDoS-protected).
- `stage`: Filter by one of the 6 canonical stages (`Applied`, `Screening`, `Interview`, `Offer`, `Hired`, `Rejected`).
- `role`: Filter by role name or title substring.
- `page`: Page number (default: `1`, minimum: `1`).
- `limit`: Records per page (default: `10`, maximum: `100`).
- `sortBy`: Field to sort on (`applicationDate`, `name`, `experience`).
- `sortOrder`: Direction (`asc` or `desc`, default: `desc`).

---

## 🧪 Automated Testing Suite

The repository includes **66 automated tests** across 8 test suites, validating backend APIs, database models, frontend components, and user workflows:

```bash
npm run test
```

```
✓ Server Test Suites: 4 passed (36 tests)
✓ Client Test Suites: 4 passed (30 tests)
✓ Total Tests:        66 passed (66 tests)
```

### Server Tests (36 Tests) — `npm run test:server`

| Test Suite                                                | Tests | Scope & Assertions                                                                                                |
| --------------------------------------------------------- | :---: | ----------------------------------------------------------------------------------------------------------------- |
| [`candidates.test.ts`](server/tests/candidates.test.ts)   |  17   | Full CRUD, pagination metadata, search filtering, stage filters, duplicate email (409).                           |
| [`reliability.test.ts`](server/tests/reliability.test.ts) |  14   | Malformed ObjectIDs (400), non-existent candidates (404), all 6 valid stage transitions, ReDoS injection defense. |
| [`analytics.test.ts`](server/tests/analytics.test.ts)     |   3   | Aggregation calculations (active vs terminal), stage breakdown counts, empty database handling.                   |
| [`health.test.ts`](server/tests/health.test.ts)           |   2   | Health response contract, database connection status reporting.                                                   |

### Client Tests (30 Tests) — `npm run test:client`

| Test Suite                                                                                  | Tests | Scope & Assertions                                                                                  |
| ------------------------------------------------------------------------------------------- | :---: | --------------------------------------------------------------------------------------------------- |
| [`CandidateWorkflows.test.tsx`](client/tests/CandidateWorkflows.test.tsx)                   |  12   | Candidate creation flow, edit modal, stage progression, delete confirmation, 409 conflict handling. |
| [`AnalyticsDashboard.test.tsx`](client/tests/AnalyticsDashboard.test.tsx)                   |   6   | KPI card rendering, stage distribution bar chart, recent candidate listing, empty state display.    |
| [`AccessibilityAndReliability.test.tsx`](client/tests/AccessibilityAndReliability.test.tsx) |   8   | ARIA attributes, keyboard accessibility (`Escape`), double-submit lock, 404 recovery.               |
| [`App.test.tsx`](client/tests/App.test.tsx)                                                 |   4   | Navigation menu links, responsive drawer, route switching.                                          |

### Additional Quality Commands

```bash
npm run typecheck    # TypeScript compilation check (server + client) -> 0 errors
npm run lint         # ESLint code style and quality check -> 0 warnings/errors
npm run build        # Full production build verification -> Exit code 0
```

---

## ☁️ Production Deployment Guide

The Mini ATS is engineered for zero-cost deployment using **MongoDB Atlas**, **Render**, and **Vercel**:

### Step 1: MongoDB Atlas Database Setup

1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com) and create an **M0 Free Cluster**.
2. Under **Database Access**, create a user (e.g. `miniatsadmin`) with read/write privileges.
3. Under **Network Access**, add `0.0.0.0/0` to allow inbound connections from Render's cloud servers.
4. Copy the connection string:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mini_ats?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render

1. Create a **New Web Service** on [Render.com](https://render.com) and connect your GitHub repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`
3. Add Environment Variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: _(Your MongoDB Atlas connection string)_
   - `CLIENT_ORIGIN`: `https://<your-vercel-app>.vercel.app` _(update after Step 3)_
4. Deploy the service and note your Render API URL (e.g. `https://mini-ats-api.onrender.com`).

### Step 3: Deploy Frontend to Vercel

1. Create a **New Project** on [Vercel](https://vercel.com) and import the same repository.
2. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable in Vercel:
   - `VITE_API_URL`: `https://<your-render-service>.onrender.com/api`
4. Click **Deploy**. Vercel will build the React SPA and publish your production URL.

### Step 4: Finalize CORS Configuration

Return to the Render dashboard, ensure `CLIENT_ORIGIN` matches your live Vercel URL, and trigger a manual redeploy so cross-origin requests are authorized.

---

## 🔒 Security & Production Hardening

- **Zero Hardcoded Secrets**: Secrets and credentials exist only in untracked `.env` files and hosting dashboards.
- **Helmet Headers**: Standard HTTP security headers enabled (XSS filter, MIME sniffing protection, Frameguard).
- **Payload Size Limits**: Strict `1mb` body parser limits to guard against buffer flooding and DoS attempts.
- **Production Error Sanitization**: Internal 500 error messages are sanitized in production; stack traces are never sent to the client.
- **Seed Safeguard**: `seed.ts` automatically aborts execution if `NODE_ENV === 'production'` unless `ALLOW_SEED_IN_PRODUCTION=true` is explicitly set, preventing accidental production data loss.
- **ReDoS Prevention**: User-supplied search queries are escaped before creating MongoDB regular expressions.

---

## 🎬 2–3 Minute Evaluator Demo Script

Follow this script to demonstrate all assignment requirements during video recording or live evaluation:

|      Time       | Section                            | Actions to Demonstrate                                                                                                                                                                                         |
| :-------------: | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0:00 – 0:30** | **Dashboard & Metrics**            | Open Dashboard. Highlight metric cards (Total Candidates, Active Pipeline, Hired, Rejected). Point out the Recharts Stage Distribution bar chart and Recent Applicants table.                                  |
| **0:30 – 1:00** | **Create Candidate**               | Navigate to Candidates. Click **Add Candidate**. Enter a valid profile. Show real-time validation by entering an invalid email. Submit the form. Show toast notification and candidate appearing in the table. |
| **1:00 – 1:30** | **Search, Filter & Sort**          | Type a name into the search bar (instant live search). Filter by stage (e.g. `Interview`). Sort by Years of Experience. Show pagination controls.                                                              |
| **1:30 – 2:00** | **Candidate Detail & Audit Trail** | Click the newly created candidate. Show the full profile and the **Stage History Audit Trail**. Transition the stage from `Applied` to `Screening` with a note. Notice the audit log updates with timestamp.   |
| **2:00 – 2:30** | **Kanban Pipeline Board**          | Open the **Hiring Pipeline** page. Show columns for all 6 canonical stages. Move the candidate to `Interview`.                                                                                                 |
| **2:30 – 3:00** | **Deletion & Metrics Update**      | Click **Delete Candidate**. Show the two-step confirmation dialog. Click Cancel, then click Confirm. Verify candidate is removed and Dashboard metrics immediately reflect the updated numbers.                |

---

## 📄 License

This project is open-source under the [MIT License](LICENSE). Built for the **EarlyJobs Full Stack Developer Intern** technical assessment.
