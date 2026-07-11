# AURORA

**A**utomotive **U**nified **R**esource, **O**perations, **R**epair & **A**nalytics platform — a production-quality core for an intelligent automotive workshop ecosystem.

![CI](https://img.shields.io/badge/tests-25%20passing-brightgreen) ![Python](https://img.shields.io/badge/python-3.11-blue) ![Next.js](https://img.shields.io/badge/next.js-15-black)

## What it does

AURORA is not a CRUD demo — it models the full operational lifecycle of a workshop, plus two intelligence layers on top:

| Capability | Description |
|---|---|
| **Workshop ERP** | Customers, vehicles, job cards with a real status state machine, parts inventory with stock control, invoices with tax + partial payments, appointments |
| **Vehicle Digital Twin** | Every vehicle accumulates health snapshots (battery, brakes, tires, oil). The twin computes a weighted health score and **predicts when each component will reach critical level** using trend analysis over the snapshot series |
| **Intelligent Diagnostics** | OBD-II codes are analyzed against a knowledge base, ranked by severity, enriched with **fleet history** ("seen 3× on this model") and an explainable per-finding confidence score |
| **Auth & RBAC** | JWT access + refresh tokens, roles (admin / manager / mechanic), route-level permission enforcement |
| **Operations dashboard** | Monthly revenue, outstanding balances, open jobs, low-stock alerts |

## Architecture

```
frontend/          Next.js 15 · React 19 · TypeScript · Tailwind CSS 4
   └── src/app     App Router pages (login, dashboard, customers, vehicles,
                   digital twin, job cards, parts, invoices)
backend/           FastAPI · SQLAlchemy 2.0 · Pydantic v2 · Alembic
   ├── app/api     Versioned REST API (/api/v1), OAuth2 + JWT, RBAC deps
   ├── app/models  Typed ORM models (SQLite dev / PostgreSQL prod)
   ├── app/services  Domain logic: digital twin engine, diagnostics engine
   └── tests/      25 API + unit tests (pytest)
docker-compose.yml PostgreSQL 16 + backend (with migrations) + frontend
.github/workflows  CI: ruff lint + pytest + Next.js build
```

Key design decisions:

- **The digital twin is derived, never stored** — health scores and predictions are pure functions over the snapshot series, so they can never drift out of sync with the data.
- **Job cards enforce a state machine** (`open → in_progress → completed → invoiced`); illegal transitions are rejected with 409, and invoicing is only possible from `completed`.
- **Inventory is transactional** — adding a part to a job card decrements stock (rejecting overdraws), removing it restores stock.
- **Diagnostics are explainable** — every finding carries likely causes, recommended actions, fleet history, and a confidence score, not a black-box answer.
- **Same code runs on SQLite and PostgreSQL** — instant local dev, real database in production.

## Quick start (local, no Docker)

Backend (Python 3.11+):

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\pip install -r requirements-dev.txt
.\.venv\Scripts\uvicorn app.main:app --reload
```

API: http://localhost:8000 · Interactive docs: http://localhost:8000/docs

Default admin (dev only): `admin@aurora.dev` / `admin12345`

Frontend (Node 22+):

```powershell
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

## Quick start (Docker)

```bash
SECRET_KEY=$(openssl rand -hex 32) docker compose up --build
```

Runs PostgreSQL 16, applies Alembic migrations, seeds the admin user and OBD knowledge base, and serves the frontend on :3000.

## Tests & lint

```powershell
cd backend
.\.venv\Scripts\python -m pytest      # 25 tests
.\.venv\Scripts\ruff check app tests  # lint
```

Tests cover the full business flow end-to-end: auth/RBAC → customer → vehicle → health snapshots → digital twin math → job card state machine → stock control → invoicing math → partial payments → diagnostics confidence model.

## API surface (v1)

```
POST   /api/v1/auth/login | /refresh          GET /auth/me
POST   /api/v1/auth/users (admin)             PATCH /auth/users/{id}
CRUD   /api/v1/customers                      GET /customers/{id}/vehicles
CRUD   /api/v1/vehicles                       PATCH /vehicles/{id}
POST   /api/v1/vehicles/{id}/health-snapshots
GET    /api/v1/vehicles/{id}/digital-twin     ← twin + predictions
CRUD   /api/v1/job-cards                      POST/DELETE items, status transitions
CRUD   /api/v1/parts  (?low_stock=true)
POST   /api/v1/invoices                       POST /invoices/{id}/payments | /void
CRUD   /api/v1/appointments
GET    /api/v1/diagnostics/codes
POST   /api/v1/diagnostics/vehicles/{id}/scan ← explainable report
GET    /api/v1/dashboard
```

## Roadmap (module-by-module, matching the AURORA vision)

The core above is Phase 1. The architecture leaves clean seams for:

- **Phase 2 — AI layer**: LLM-powered diagnostic explanations (the diagnostics engine already returns a structured report an LLM can narrate), semantic search over repair history.
- **Phase 3 — Parts intelligence**: multi-market supplier comparison, landed-cost calculator, counterfeit-risk flags.
- **Phase 4 — Customer portal**: read-only vehicle twin, quote approval, online payment.
- **Phase 5 — IoT**: MQTT ingestion of live OBD data straight into health snapshots (the twin needs no changes — it already consumes snapshot series).
- **Phase 6 — Knowledge graph**: promote the fleet-history heuristic to a graph of vehicle ↔ symptom ↔ repair ↔ outcome.

## License

MIT
