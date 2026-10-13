# Phase 3 — Database and backend foundation

**Status:** AWAITING TEAM VERIFICATION · **Branch:** `phase-3` (local, not pushed) · **Date:** 2026-10-14
**Approval of Phase 2 recorded:** 2026-10-13, "approved, go to Phase 3" (merged to `main`, tag `phase-2-approved`).

## 1. Requirements addressed

| Area | Delivered |
|---|---|
| Prisma schema (TRD §4) | 16 models + 5 enums: categories, items, images, add-on groups/options, item relations, offers, offer items, banners, café info, opening hours, gallery, feedback, admin allowlist, audit log, rate-limit buckets. Money in integer paise; `isDemo` on content; indexes for menu queries. |
| Migrations | `20261013180817_init` (generated) + `20261013181000_security_rls` (hand-written): 22 CHECK constraints, RLS on every table with no policies, privileges revoked from `anon`/`authenticated` (including default privileges for future objects). |
| Seed | Guarded (`ALLOW_DEMO_SEED=true`, never in production), create-only (never overwrites or deletes), no admin or password. Creates 6 categories, 17 items (1 unpublished, 2 unavailable), add-ons, 8 relations, 6 offers (3 active, 1 scheduled, 1 expired, 1 unpublished), the café row and 7 days of hours. Every value is labelled demo/unverified. 9 local placeholder images in `public/demo/`. Plus `db:remove-demo -- --confirm`. |
| Validation | `src/lib/validation/public.ts`: menu query (q ≤60 with control characters stripped, category slug, price ₹0–1,00,000 inclusive with min ≤ max, popular/offers flags, sort, page 1–1000, pageSize 1–48), slugs, offers query. |
| Data-access layer | `src/server/services/*` (the only Prisma users; explicit `select` DTOs): categories, menu list/detail, offers list/detail, café, health. Public visibility rules live in one place (`visibility.ts`). |
| Public read APIs | `GET /api/v1/categories`, `/menu`, `/menu/[slug]`, `/offers`, `/offers/[slug]`, `/cafe`; `/api/health` now includes `db`. |
| Error handling | `src/server/http.ts`: `{data, meta?}` / `{error:{code,message,fields?}}`; Zod → 400, P2002/P2003 → 409, P2025 → 404, DB unreachable → 503, else 500. No internals in responses or logs; every response has an `X-Request-Id`. |
| API docs | TRD §6 updated with implemented contracts and DTO shapes. |

## 2. Files created or modified

- **New:**
  - `prisma/` — `schema.prisma`, `migrations/*`, `seed.ts`, `seed-guard.ts`, `demo-data.ts`, `client.ts`, `remove-demo.ts`
  - `prisma.config.ts`
  - `src/server/` — `db.ts`, `env.ts`, `http.ts`, `log.ts`, `services/{visibility,categories,menu,offers,cafe,health}.ts`
  - `src/lib/media.ts`, `src/lib/validation/public.ts`
  - `src/app/api/v1/**/route.ts` (6 routes)
  - `scripts/test-db.sh`, `scripts/make-demo-images.mjs`, `public/demo/*.webp`
  - `vitest.integration.config.mts`
  - Tests: `tests/integration/{setup,helpers,schema.test,rls.test,api.test}.ts`, `tests/supabase/rest-denied.test.ts`, `tests/unit/{validation,offer-hours,server-helpers}.test.ts`, `tests/e2e/api.spec.ts`
- **Modified:**
  - `src/app/api/health/route.ts`, `src/lib/format.ts` (offerStatus, IST clock, isOpenNow, HH:MM)
  - `package.json`/lock (Prisma 7.10, pg adapter, tsx; `prisma` moved to devDependencies; overrides; db/test scripts)
  - `eslint.config.mjs`, `.gitignore`, `.prettierignore`, `vitest.config.mts`, `playwright.config.ts`, `tests/e2e/foundation.spec.ts`
  - `README.md`, `docs/{TRD,DEPLOYMENT,SECURITY,DECISIONS,TEST_PLAN,TRACEABILITY,PROGRESS,WORKLOG}.md`

## 3. Design and architecture decisions

These are ADR-033 to ADR-039 in `DECISIONS.md`:

- **ADR-033 — Prisma 7 setup.** The CLI uses `DIRECT_URL` via `prisma.config.ts`. The runtime uses the pooled `DATABASE_URL` through the `PrismaPg` adapter (pool of 5, 10 s statement timeout). The generated client lives in `src/generated/` and is git-ignored.
- **ADR-034 — test database.** Automated database tests use a **throwaway Docker Postgres** that mimics Supabase's API roles, so they never touch your Supabase projects. A "reset" recreates the container. I don't use `prisma migrate reset`; Prisma also blocks it for AI agents.
- **ADR-035 — no API caching yet.** The APIs are uncached (`no-store`, `connection()`), so they are always fresh. Page caching is decided in 4A/5B.
- **ADR-036 — dependency overrides.** npm overrides patch advisories in the Prisma CLI's dependencies. The production dependency audit is 0.
- **ADR-037 — search escaping.** Searches escape LIKE wildcards (a defect found during self-verification).
- **ADR-038 — seed policy.** The seed is create-only and guarded.
- **ADR-039 — schema details.** The `CategoryIcon` enum, the café `*Verified` flags, a database-enforced limit of 4 images per item, and the rate-limit unique key including `scope`.

## 4. Commands actually executed (summary)

```
npm install -E prisma@7.10.0 @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0 pg@8.23.1 ; npm install -DE @types/pg tsx
npx prisma generate ; npx prisma migrate dev --name init --create-only   (against the local test container)
npx prisma migrate deploy ; npx tsx prisma/seed.ts (refused without flag) ; ALLOW_DEMO_SEED=true … (twice: 2nd created 0)
DATABASE_URL=<test container> npx next dev -p 3100 + curl of every endpoint (manual exercise)
npm run check ; npm run test:integration ; npm run test:supabase ; npm run test:e2e
npm audit ; npm audit --omit=dev ; gitleaks (Docker) dir + git ; grep scan of .next/static
rm -rf src/generated && npm ci && npm run typecheck   (clean-install reproducibility)
```

## 5. Test results

| Suite | Result |
|---|---|
| `npm run check` (lint 0 warnings, typecheck, Prettier, build) | **PASS** |
| Unit + component (Vitest) | **PASS** 101/101 (85 unit incl. 54 new + component) |
| Integration (real Postgres): constraints, RLS, contracts, filters, pagination, visibility, offers, injection, health/DB-down | **PASS** 65/65 |
| E2E (Playwright, production build, Chromium + WebKit) | **PASS** 68/68 (56 from Phase 2 + 12 new) |
| TC-SEC-020: Supabase REST API denial on the real dev project | **NOT RUN**: no Supabase URL/key in `.env.local` yet (35 cases reported as skipped) |
| Migrations + seed against the team's **dev Supabase** project | **NOT RUN**: `.env.local` does not exist yet. Verified only against local Postgres 17 |
| Clean `npm ci` + client generation | **PASS** |

## 6. Security checks and findings

- **RLS deny-all:** 17/17 tables have RLS and there are 0 policies. `anon` and `authenticated` get `permission denied` on SELECT, DELETE and INSERT: **PASS** (TC-SEC-022). A test fails if a future table lacks RLS.
- **Injection payloads:** SQL, wildcard, template, NoSQL-style and XSS strings are treated as text in search, and slugs/category are rejected with 400: **PASS** (TC-SEC-090).
- **Defects found and fixed during self-verification:**
  1. A search for `%` or `_` matched every item, because Prisma does not escape LIKE wildcards. Fixed and covered by regression tests TC-UNIT-013 and TC-SEC-090.
  2. The `Offer_price_matches_kind` CHECK let a DISCOUNT/COMBO offer with a NULL price through, because SQL treats NULL as a pass. Fixed with `IS NOT NULL`; regression test in TC-INT-002. The migration was corrected before being applied anywhere except the throwaway test DB.
- **Safe errors:** no stack traces, SQL, Prisma codes or connection strings in responses; a database outage returns a generic 503: **PASS**.
- **No internal fields in public DTOs:** strict contract tests **PASS**.
- **Client bundles:** no DB URLs, secret names or Prisma: **PASS**.
- **gitleaks:** clean for project files. The 12 hits are only Next.js per-build keys in the git-ignored `.next/`.
- **`npm audit --omit=dev`:** 0. The full audit shows only the accepted dev-only `braces` chain (ADR-032).

## 7. UI consistency

There is no UI in this phase. The Phase 2 style guide and its E2E checks are unchanged and still pass. Demo placeholder images use the brand-token tints and are labelled "DEMO IMAGE".

## 8. Known defects and limitations

- No open defects.
- Not verified against Supabase yet: the migrations, seed and REST denial need the team's dev project (see §5).
- Demo offers have dates relative to the first seed run, so they expire after 30 days. Re-seeding does not refresh existing rows; remove them with `db:remove-demo` and seed again.
- Opening hours past midnight are not supported (Q-05).
- All café values are unverified placeholders.
- I couldn't open `.env.example` in this session because project permissions block reading `.env*` files. It was written in Phase 2 and lists the TRD §8 variables. Please check it contains `DATABASE_URL`, `DIRECT_URL` and `ALLOW_DEMO_SEED`.

## 9. Documentation and traceability

- **TRD:** §3, §4 and §6 updated.
- **DEPLOYMENT:** §4 and §5 rewritten, plus a new §5.1 on the test DB.
- **SECURITY:** controls and Phase 3 verification rows added.
- **DECISIONS:** ADR-033 to ADR-039 added.
- **TEST_PLAN:** new IDs (TC-UNIT-070/071/080, TC-INT-004/031, TC-SEC-022) and commands.
- **TRACEABILITY:** 17 rows moved to In progress or Verified (NFR-007) with phase-3 evidence. No Must-have UI requirement is marked complete.
- **README:** setup and commands updated.

## 10. Evidence for the gate ("database and API integration tests pass")

Integration 65/65 and E2E 68/68 pass against a real Postgres with the real migrations and seed. The only gaps are the two NOT RUN items above, both waiting on Supabase credentials.

## 11. Self-verification

- I ran a dev server against the seeded test database and called every endpoint with curl: valid and invalid queries, all filters combined, an inclusive price boundary, sorting, pagination, unknown/unpublished/archived slugs, expired, scheduled and draft offers, the café, health, and the response headers. That is how I found defect 1.
- Playwright then exercised the same API on a production build in Chromium and WebKit, and checked that the demo image is served.

---

## HOW TO TEST THIS PHASE

**1. Prepare** (once):

- Create a **development** Supabase project.
- From *Connect*, put two values in `.env.local` (never paste them in chat):
  - `DATABASE_URL` = the Transaction pooler string (port 6543)
  - `DIRECT_URL` = the Direct connection string (or the Session pooler if you have no IPv6)
- Optionally add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from *Project Settings → API Keys*.

**2. Install, migrate, seed, run:**
```bash
git switch phase-3
npm ci
npm run db:migrate:deploy                # expect: 2 migrations applied
npm run db:migrate:status                # expect: "Database schema is up to date!"
npm run db:seed                          # expect: "Seed refused: Set ALLOW_DEMO_SEED=true …"
ALLOW_DEMO_SEED=true npm run db:seed     # expect: Created { categories: 6, items: 17, offers: 6, … }
ALLOW_DEMO_SEED=true npm run db:seed     # expect: Created { …all 0 } (safe to re-run)
npm run dev
```

**3. Open in the browser** (Firefox shows JSON nicely):

- http://localhost:3000/api/health → `"status":"ok","db":"ok"`
- http://localhost:3000/api/v1/categories → 6 categories with `itemCount`
- http://localhost:3000/api/v1/menu?q=burger&category=burgers&minPrice=100&maxPrice=150 → only "Paneer Tikka Burger"
- http://localhost:3000/api/v1/menu/classic-veg-burger → add-ons, related, frequently bought together, combo
- http://localhost:3000/api/v1/offers → 3 active and 1 scheduled; no "expired" or "draft" offer
- http://localhost:3000/api/v1/cafe → placeholder address, every `verified` flag false, 7 hours rows

**4. Manual checks** (expected results):

1. `/api/v1/menu?pageSize=100` → **400** with `"fields":{"pageSize":…}`.
2. `/api/v1/menu/pink-sauce-pasta` (unpublished) → **404** `NOT_FOUND`. `/api/v1/offers/old-pasta-offer` (expired) → **404**.
3. `/api/v1/menu?q=%25` (a `%` search) → `"total":0`, not every item.
4. In Supabase *Table Editor*, every table shows "RLS enabled". Change a `MenuItem`'s `isAvailable` to false; `/api/v1/menu/<that slug>` shows `"isAvailable":false` on the next request.
5. If you added the Supabase URL and key: `npm run test:supabase` → 34 passed (1 "NOT RUN" placeholder skipped).

**5. Automated tests** (Docker Desktop must be running; they use a local throwaway DB, not Supabase):
```bash
npm run check              # expect: PASS, 101 tests
npm run test:integration   # expect: 65 passed
npx playwright install chromium webkit   # once
npm run test:e2e           # expect: 68 passed
npm run test:db:down       # remove the test container
```

**Known limitations (not bugs):**
- There are no web pages yet; the pages arrive in Phase 4A.
- All data is demo data.
- Demo offers expire 30 days after the first seed.
- npm prints "install-scripts not covered by allowScripts" warnings. This is expected (ADR-033).

**If something fails, send back:** the exact command, its full terminal output (check it contains no connection strings first), and for the browser, the URL and the JSON response.

Phase 3 complete. Waiting for your approval or bug reports before starting Phase 4A. To approve, reply exactly: approved, go to Phase 4A

---

## Round 2 — 2026-10-14

**Bug reported by the team:** `npm run test:supabase` still showed every test as skipped after the Supabase URL and publishable key were added to `.env.local`.

- **Cause:** the test loaded `.env.local` through `@next/env`. Vitest sets `NODE_ENV=test`, and in test mode Next.js deliberately skips `.env.local`, so the keys were never read.
- **Fix:** `tests/supabase/rest-denied.test.ts` now reads `.env.local` with Node's `process.loadEnvFile`, which does not override variables already set in the shell.
- **Regression evidence:** the same command now runs every case. The skip placeholder only appears when the keys are really missing.

| Check | Result |
|---|---|
| Team ran `npm run db:migrate:deploy` + seed on the dev Supabase project | Done by the team; `prisma migrate status` → "2 migrations found … Database schema is up to date!" |
| **TC-SEC-020** Supabase REST API denial (17 tables: read, insert, update, delete) against the dev project | **PASS**, 34 passed (1 "NOT RUN" placeholder skipped, as designed) |

No other files changed. The earlier results (check, integration and E2E) are unaffected, because they don't use this file.

Phase 3 complete. Waiting for your approval or bug reports before starting Phase 4A. To approve, reply exactly: approved, go to Phase 4A

