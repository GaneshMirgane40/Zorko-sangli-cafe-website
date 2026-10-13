# ZORKO Sangli — Smart Café Digital Platform

Mini Project II (7VSIT345), B.Tech IT, Walchand College of Engineering, Sangli — Utkarsh Patil, Ganesh Mirgane, Anushka Patil. Guide: Smt. Bharati S. Shetty. Academic year 2026-27.

> Student project. Not an official ZORKO website.

**Status:** application foundation (Phase 2): tokens, UI components, health endpoint and test tooling. There is no database or real pages yet. Current phase and approvals: [`docs/PROGRESS.md`](docs/PROGRESS.md).

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Prisma 7 · PostgreSQL, Auth and Storage on Supabase · Vercel. Details and versions: [`docs/TRD.md`](docs/TRD.md), [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Documentation

| Doc | Purpose |
|---|---|
| [PRD](docs/PRD.md) | Requirements (FR/NFR) and acceptance criteria |
| [TRD](docs/TRD.md) | Architecture, schema, API contracts |
| [UI_SPEC](docs/UI_SPEC.md) | Authoritative visual spec derived from `design/stitch/` |
| [SECURITY](docs/SECURITY.md) | Threat model and controls |
| [TEST_PLAN](docs/TEST_PLAN.md) | Test strategy and cases |
| [TRACEABILITY](docs/TRACEABILITY.md) | Requirement → code → test → evidence |
| [DEPLOYMENT](docs/DEPLOYMENT.md) | Setup, environments, provisioning, rollback |
| [OPEN_QUESTIONS](docs/OPEN_QUESTIONS.md) | Information still needed from the café/team |

## Setup

Requirements: Node.js 22 LTS (≥22.13), npm 11, Git. Docker Desktop for the automated DB tests.

```bash
npm ci                                  # install exact versions (also generates the Prisma client)
cp .env.example .env.local              # then set DATABASE_URL and DIRECT_URL (dev Supabase project)
npm run db:migrate:deploy               # create tables + RLS deny-all on the dev database
ALLOW_DEMO_SEED=true npm run db:seed    # clearly labelled demo data (refuses in production)
npm run dev                             # http://localhost:3000
```

- Health check: http://localhost:3000/api/health (`"db":"ok"` when the database is reachable)
- Public read API (Phase 3): `/api/v1/categories`, `/api/v1/menu?q=&category=&minPrice=&maxPrice=&popular=1&offers=1&sort=&page=&pageSize=`, `/api/v1/menu/<slug>`, `/api/v1/offers`, `/api/v1/offers/<slug>`, `/api/v1/cafe`. Contracts: [TRD §6](docs/TRD.md).
- Database details, demo-data removal and connection strings: [DEPLOYMENT §5](docs/DEPLOYMENT.md).
- Component style guide (development only): http://localhost:3000/dev/styleguide

## Checks

```bash
npm run lint          # ESLint (zero warnings allowed)
npm run typecheck     # next typegen + tsc
npm run format:check  # Prettier
npm test              # Vitest unit + component tests
npm run build         # production build
npm run check         # all of the above in sequence
npx playwright install chromium webkit   # once per machine
npm run test:integration  # Docker test DB (port 54329) + DB/API integration tests
npm run test:e2e      # Docker test DB + Playwright on Chromium + WebKit (port 3100)
npm run test:supabase # RLS denial check against the dev Supabase project (needs URL + publishable key)
```

Admin and deployment instructions are added in later phases (see [DEPLOYMENT](docs/DEPLOYMENT.md)).
