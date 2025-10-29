# FinFlow MVP TODO

This checklist tracks the initial MVP for the Intelligent Credit Risk & Loan Recovery Platform.

## Current state (Done)
- Next.js 16 app with React 19, Tailwind 4 styling
- Auth flows: signup, login, logout (MongoDB-backed, bcrypt password hash)
- Protected Loan Application page with a comprehensive client form
- API: `POST /api/loan-application` inserts applications into MongoDB
- DB helper: Mongo client with connection reuse; env-driven `MONGODB_URI`

## MVP scope (target)
A minimal, end-to-end flow that accepts a loan application, computes a risk score with explanations from alternative data, stores the decision, and exposes a basic admin dashboard. Include simple recovery orchestration stubs to demonstrate strategy scheduling.

## High-priority next steps

### 1) Credit Assessment Module
- [ ] API: `POST /api/risk-score`
  - Inputs: applicant profile (age, income, loan amount, existing loans, email/mobile)
  - Logic: rule-based + simple features from two data sources (see below)
  - Output: `{ score: 0-100, band: 'low'|'medium'|'high', explanation: string[], features: object }`
- [ ] Integrate into submission
  - [ ] Update `POST /api/loan-application` to call risk scoring
  - [ ] Persist `{score, band, explanation}` in `loan_applications`
  - [ ] Return decision payload to client (for receipt UI)
- [ ] Alt data sources (mock)
  - [ ] Transactions generator: derive activity consistency, avg balance proxy, NSFs
  - [ ] Digital footprint: email domain risk, phone pattern, time-of-day stability
- [ ] Explainability
  - [ ] Include top 3 feature contributions in response (deterministic weights)

### 2) Recovery Orchestration (stub)
- [ ] Collections: `recovery_plans`, `recovery_messages`
- [ ] API: `POST /api/recovery/schedule`
  - Inputs: `applicationId`, `segment` (e.g., low willingness/high ability), `strategy`
  - Output: plan with next-steps timeline; store in DB
- [ ] API: `POST /api/recovery/dispatch`
  - Simulate sending (log + insert message record)
  - Accept `Idempotency-Key` header; treat duplicates as no-op
- [ ] Config: `src/app/config/recovery.json` with templates, escalation rules

### 3) Admin Dashboard
- [ ] Protected route: `/admin`
  - [ ] Metrics: total apps, approvals by band, avg score, pending recoveries
  - [ ] Table: recent applications with score/band/explanation
  - [ ] Settings: threshold sliders (approve ≥ X, manual review range)
  - [ ] Export: button that calls `GET /api/admin/export` (CSV of decisions)

### 4) Platform hygiene & ops
- [ ] Health: `GET /api/health` returns `{ ok: true, uptimeMs }`
- [ ] Basic request timing + structured logs in API routes
- [ ] Simple in-memory rate limiting per-IP for write endpoints (demo-only)
- [ ] Cache: in-memory TTL cache of recent risk scores (keyed by email+amount)
- [ ] README: add run instructions and environment notes

### 5) Tests (minimum)
- [ ] Unit tests for scoring function (happy path + boundary cases)
- [ ] Unit tests for feature extraction from mock data sources
- [ ] (Optional) Integration test for `POST /api/loan-application` using mocked DB

## Nice-to-haves (later)
- RAG for compliance Q&A endpoint `/api/compliance/query` on local policy PDFs
- Simple agent loop to adapt recovery messaging tone based on features
- Redis cache integration for risk score cache
- Queue collection + worker route to simulate async processing (DLQ field)
- Simple A/B testing flag for two recovery templates; capture metrics

## Acceptance for MVP
- Submit application → risk score computed → decision stored and visible in `/admin`
- Two mock alternative data sources inform the score and explanations
- Recovery APIs can schedule and simulate dispatch with idempotency
- Health endpoint and basic metrics available

## Blockers / Notes
- Real schedulers/background jobs are not configured; use route-triggered simulation
- Cookie token is placeholder; replace with JWT or NextAuth for production
- Rate limiting and caching are in-memory (stateless hosting resets state)

---

## Implementation notes (sketch)
- New files to add:
  - `src/app/api/risk-score/route.js`
  - `src/app/api/recovery/schedule/route.js`
  - `src/app/api/recovery/dispatch/route.js`
  - `src/app/api/admin/export/route.js`
  - `src/app/api/health/route.js`
  - `src/app/admin/page.jsx`
  - `src/app/config/recovery.json`
  - `src/lib/scoring.js` (feature extraction + scoring)
  - `src/lib/cache.js` (tiny TTL cache helper)
- Modify:
  - `src/app/api/loan-application/route.js` to call scoring and persist results
