# WORKLOG — resume point and task history

**Purpose:** if a session stops (usage limit, crash, `/clear`), anyone, human or assistant, can read this file and know exactly where the work stands and what to do next. It is updated **after every completed task**, not only at phase ends.

- `docs/PROGRESS.md` holds the official phase status and approvals.
- This file is the finer-grained task log.
- If the two disagree, `PROGRESS.md` wins for approvals; this file wins for "what was the last thing done".

---

## ▶ RESUME HERE

| | |
|---|---|
| **Current phase** | Phase 2 — Application foundation |
| **Phase status** | AWAITING TEAM VERIFICATION. All Phase 2 work is done and committed. Do **not** start Phase 3 until the team replies exactly `approved, go to Phase 3`. |
| **Git** | Branch `phase-2`, last commit `89089f5`. `main` holds phases 0–1 (tags `phase-0-approved`, `phase-1-approved`). Nothing pushed (no remote). |
| **Last task completed** | Created this WORKLOG (2026-10-13). |
| **Next action** | Wait for the team's reply. On approval: follow the "On approval" steps below, then start Phase 3. On a bug list: set PROGRESS to `CHANGES REQUESTED`, fix on `phase-2`, add regression tests, append "Round 2" to `docs/PHASE_REPORTS/phase-2.md`. |
| **Waiting on the team** | (1) Approval phrase for Phase 2. (2) For Phase 3: a **development** Supabase project, with `DATABASE_URL` and `DIRECT_URL` placed in `.env.local` by the team (never pasted in chat); optionally `NEXT_PUBLIC_SUPABASE_URL` + publishable key. (3) Optional: `sudo chown -R $(whoami) ~/.npm` to fix their npm cache (ADR-030). (4) Open questions Q-01…Q-20 in `docs/OPEN_QUESTIONS.md`. |

### On approval (the CLAUDE.md §0.2 step 8 routine)
1. In `PROGRESS.md`: add a row to "Approved phases" (date + quoted message), set the current phase and status to `IN PROGRESS`, and update the branch.
2. `git commit` that change on the phase branch, then:
   ```bash
   git switch main && git merge --no-ff phase-N -m "Merge phase-N (approved)"
   git tag phase-N-approved
   git switch -c phase-(N+1)
   ```
3. Update this file's RESUME HERE block, then start the next phase with a task list.

### How to verify the current state quickly
```bash
cd ~/projects/zorko-sangli
git status && git log --oneline -5 && git tag
npm ci && npm run check                 # lint, typecheck, format, unit tests, build
npm run test:e2e                        # Playwright, expect 56 passed
```

---

## Things a newcomer must know (gotchas found so far)

- **Rules:** read `CLAUDE.md` first (phase-by-phase, stop after each phase, exact approval phrase). Never read or print `.env*` (also blocked by `.claude/settings.json`; keep that file byte-for-byte, and note it is excluded from Prettier).
- **Next.js 16.4 is newer than most training data.** Read `node_modules/next/dist/docs/` before coding (see `AGENTS.md`).
  - Cache Components is on. Request data (`searchParams`, `cookies()`) must be read inside `<Suspense>`, otherwise the build fails.
  - Error boundaries use `retry()`.
  - `PageProps` / `LayoutProps` are generated types, so typecheck runs `next typegen` first.
- **Prisma:** npm `latest` is a release candidate (8.0.0-rc). Use stable **7.10.0** (ADR-002).
- **Safari/WebKit specifics:**
  - HSTS and `upgrade-insecure-requests` break `http://localhost`, so they are sent only for https sites (ADR-028).
  - In Playwright WebKit, keyboard tests use **Option+Tab**.
  - Safari doesn't focus buttons on mouse click.
- **`npm ci` "Missing … from lock file":** caused by root-owned files in `~/.npm`. Use `--cache /tmp/zorko-tools/.npm-cache`, or fix the ownership (ADR-030).
- **Dev-only advisory:** `npm audit` shows 5 "high" findings from one dev-only chain (`braces`, no patch exists). Accepted in ADR-032. `npm audit --omit=dev` must stay at 0.
- **Style guide in a production build:** `/dev/styleguide` needs `ENABLE_STYLEGUIDE=true` for both `build` and `start`.
- **Scratch tools** live in `/tmp/zorko-tools`, outside the repo; it may be wiped on reboot. Contents:
  - `outline.py`: Stitch HTML outline;
  - `contrast.py`: WCAG contrast calculator;
  - `render.js`: Stitch reference renders;
  - `mermaid-check.js`: diagram validation;
  - a clean npm cache.

  Recreate them if needed; none are required to build or test the app.
- **gitleaks** runs via Docker:
  ```bash
  docker run --rm -v "$PWD:/repo:ro" ghcr.io/gitleaks/gitleaks:latest git /repo --no-banner --redact
  ```

---

## Task history (newest first)

### Phase 2 — Application foundation (2026-10-13) — AWAITING TEAM VERIFICATION
- [x] Created `docs/WORKLOG.md` (this file), at the team's request.
- [x] Phase 2 report + PROGRESS → `AWAITING TEAM VERIFICATION` (commit `89089f5`).
- [x] Docs updated: DECISIONS (versions pinned; ADR-028…032), UI_SPEC V-12…V-14, SECURITY (R-12/R-13 + results), TEST_PLAN, TRACEABILITY, README, DEPLOYMENT §4.
- [x] Verification:
  - clean `npm ci`;
  - lint, typecheck, format, 39 Vitest tests, build;
  - 56 Playwright tests (Chromium + WebKit);
  - `npm audit --omit=dev` = 0;
  - bundle secret scan = 0;
  - gitleaks: working tree clean (hits only in ignored `.next/`), git history clean;
  - dev-server smoke test;
  - screenshots reviewed.
- [x] Fixed bugs found during verification: Safari HSTS/upgrade, heading font, 2 contrast failures, touch targets, dialog focus, lockfile, CSS comment, settings.json reformat (details in `phase-2.md` §4).
- [x] Tests: `tests/unit/*`, `tests/component/ui.test.tsx`, `tests/e2e/{foundation,styleguide}.spec.ts`; `vitest.config.mts`, `playwright.config.ts`.
- [x] Style guide `/dev/styleguide` (dev-only) + interactive demos.
- [x] UI components in `src/components/ui/` (≈20).
- [x] App shell: layout + fonts, tokens in `globals.css`, home placeholder, 404/error/global-error, `/api/health`, env validation (`src/lib/config/env.ts` + `instrumentation.ts`), security headers.
- [x] Tooling: ESLint (`react/no-danger`), Prettier, `.env.example`, `.github/workflows/ci.yml` (inactive until a GitHub remote exists).
- [x] Scaffold: reference `create-next-app@16.4.0` in /tmp; dependencies installed with exact pins; Playwright browsers installed.
- [x] Read the Next 16.4 bundled docs (fonts, cacheComponents, error handling, route handlers, headers, CSP, Vitest).
- [x] Phase 1 approval recorded, merged to `main`, tagged `phase-1-approved`, branch `phase-2` created.

### Phase 1 — Requirements, architecture, design spec (2026-10-13) — APPROVED
- [x] PRD, TRD, UI_SPEC, SECURITY, TEST_PLAN, TRACEABILITY, DEPLOYMENT, DECISIONS (ADR-001…027), OPEN_QUESTIONS, README.
- [x] Stitch references rendered to `design/reference/` (5 PNGs).
- [x] Checks: ID cross-references, contrast table, Mermaid diagrams (5/5 render).
- [x] Approved by the team: "approved, go to Phase 2".

### Phase 0 — Repository discovery and baseline (2026-10-13) — APPROVED
- [x] Setup: Stitch zip → `design/stitch/`; synopsis (`MINI PROJECT SYN (2).pdf`) → `docs/source/synopsis.pdf`; `.claude/settings.json`; duplicate root Stitch folder deleted (team instruction).
- [x] `.gitignore`, initial commit on `main`; synopsis read (11 pages); differences D-01…D-15 listed; `PROGRESS.md` created.
- [x] Approved by the team: "approved, go to Phase 1".

---

## Upcoming phases (from CLAUDE.md §12)

3 Database & backend → 4A Public site core → 4B Public site remainder → 5A Auth & admin shell → 5B Menu admin → 5C Offers/banners/café/gallery admin → 6 QR & feedback → 7 Security hardening → 8 Deployment readiness.
