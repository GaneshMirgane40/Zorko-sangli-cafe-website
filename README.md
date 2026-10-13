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

Requirements: Node.js 22 LTS (≥22.13), npm 11, Git.

```bash
npm ci                                  # install exact versions from package-lock.json
cp .env.example .env.local              # optional in Phase 2 (defaults to http://localhost:3000)
npm run dev                             # http://localhost:3000
```

- Health check: http://localhost:3000/api/health
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
npm run test:e2e      # Playwright on Chromium + WebKit (builds and starts the app on port 3100)
```

Database, admin and deployment instructions are added in later phases (see [DEPLOYMENT](docs/DEPLOYMENT.md)).
