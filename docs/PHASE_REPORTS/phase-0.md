# Phase 0 — Repository discovery and baseline

**Status:** AWAITING TEAM VERIFICATION
**Date:** 2026-10-13
**Branch:** `phase-0` (local; branched from `main` at the initial commit)

## 1. Requirements addressed

CLAUDE.md Section 12 (Phase 0) and Section 18: Git baseline, repository inspection, full synopsis read, synopsis vs prompt differences, Stitch screen inventory, baseline checks, `docs/PROGRESS.md`.

## 2. Project setup performed (before Phase 0, at the team's request)

| Step | Result |
|---|---|
| Tool versions | Node v22.13.1, npm 11.19.1, Git 2.52.0, Docker 29.8.2 (engine running) |
| Branch | Already `main`; no rename needed |
| `CLAUDE.md` | Present in root |
| Folders | `docs/source`, `design/stitch`, `.claude` exist |
| Design zip | `~/Downloads/stitch_zorko_sangli_smart_caf_platform.zip` unzipped into a temp folder outside the project; 6 folders copied to `design/stitch/`; temp folder removed afterwards; nothing from the zip was executed |
| Duplicate folder | The old root copy `stitch_zorko_sangli_smart_caf_platform/` was compared with `diff -rq` (identical apart from a `.DS_Store`) and deleted on the team's instruction |
| Synopsis | Path given (`~/Downloads/MINI_PROJECT_SYN_2.pdf`) did not exist; team confirmed `~/Downloads/MINI PROJECT SYN (2).pdf`, copied to `docs/source/synopsis.pdf` |
| `.claude/settings.json` | Created with the deny rules for `.env` / `.env.*` reads |

## 3. Repository baseline

- Git repository existed with **no commits**. Created `.gitignore` (node, env files except `.env.example`, build/test output, `.claude/settings.local.json`, OS files) and made the first commit on `main`: `e67ea88 Initial commit: project brief, synopsis and Stitch design export`.
- No application code, no `package.json`, no lockfile, no dependencies, no scripts, no tests, no CI, no env files.
- Package managers available: npm only (pnpm and yarn not installed) → npm + `package-lock.json` will be used (rule 25).
- Not installed: `gitleaks` (secret scanner) and Supabase CLI. Neither is needed until later phases; noted in backlog.
- No secrets found or printed. No `.env` file exists in the project.

## 4. Stitch design inventory (CLAUDE.md 6.1)

All required files are present in `design/stitch/`:

| Folder | Files | screen.png size (px) |
|---|---|---|
| `smart_culinary_energy/` | `DESIGN.md` | — |
| `zorko_sangli_desktop_home/` | `screen.png`, `code.html` | 540 × 1600 |
| `zorko_sangli_desktop_digital_menu/` | `screen.png`, `code.html` | 840 × 1600 |
| `zorko_sangli_desktop_item_details/` | `screen.png`, `code.html` | 872 × 1600 |
| `zorko_sangli_desktop_offers_combos/` | `screen.png`, `code.html` | 639 × 1600 |
| `zorko_sangli_offers_combos/` (only mobile screen) | `screen.png`, `code.html` | 211 × 1600 |

Observations (no rediscovery, just confirmation of CLAUDE.md 6.1):
- Every `code.html` loads Tailwind from `https://cdn.tailwindcss.com` and contains the `#a93200` primary token; `DESIGN.md` prose uses `#F15A24` while its YAML uses `#a93200`. The colour conflict described in 6.1 is confirmed.
- PNGs are low resolution, as expected. Reference renders are a Phase 1 task.

**Missing Stitch screens (to be derived in Phase 1, as CLAUDE.md expects):** Student Zone, Gallery, About/Contact, feedback form, QR page, all admin screens, mobile home/menu/item details, 404/error/empty/loading states.

## 5. Synopsis read (all 11 pages)

Pages: 1 cover; 2–3 abstract, keywords, objectives, introduction; 3–4 methodology modules; 5 flowchart; 6–10 pseudocode; 11 signatures.

Flowchart confirms the stack: Next.js backend (API Routes / Server Actions) → Prisma ORM → PostgreSQL (Supabase). Customer flow: browse menu → search & filter → food details → contact & location → scan QR → feedback. Admin flow: login (retry on invalid) → dashboard (items, offers, feedback) → manage menu items → prices & availability → offers/combos/banners/café info → logout.

### Synopsis vs CLAUDE.md differences

| # | Synopsis says | CLAUDE.md says | Proposed handling |
|---|---|---|---|
| D-01 | Abstract and keywords list a "Loyalty and Reward Program" as a feature; methodology lists it under future expansion | Out of scope (3.0) | Future work; ask guide (A-01) |
| D-02 | `AdminLogin(Username, Password)` checks `AdminCredentials` stored in the database | Supabase Auth + `AdminUser` allowlist; no app-side password storage | Follow CLAUDE.md; login by email + password (A-02) |
| D-03 | `ManageMenu` DELETE removes the row | Soft-archive by default; hard delete only when unreferenced | Follow CLAUDE.md (A-03) |
| D-04 | "Frequently Bought Together" = `FetchCombosFor(FoodID)` (combos) | FBT = admin-managed item associations; combos also shown | Show both: related/FBT associations and combos containing the item (A-04) |
| D-05 | "Customer reviews" displayed; feedback submitted by users | Feedback must be moderated; never fabricate ratings/testimonials | Public reviews = approved feedback only (A-05) |
| D-06 | "Customer Gallery & Reviews" on contact page | Gallery uploaded by admins (4.6) | Admin-managed gallery only (A-06) |
| D-07 | Admin manage list omits gallery, feedback moderation, audit log | Includes them (4.6, 4.7, 4.9) | CLAUDE.md adds them; these support synopsis items ("other website content", dashboard "Feedback") |
| D-08 | `SearchAndFilter` loads all items and filters in memory | Server-side filtering, pagination and limits | Implement as DB queries; same filter semantics (AND of all filters) |
| D-09 | `FetchTrendingItems(limit=5)` on home | No number specified | Use 5 (A-07) |
| D-10 | Popularity filter = `Item.IsPopular` boolean; offer filter = `Item.HasOffer` | Popularity + offer-only filters; best-seller/trending are admin flags | `isPopular` derived from best-seller/trending flags; `hasOffer` derived from active offers linked to the item |
| D-11 | "SYNC Database to Live Website" after availability/offer changes | Visible within 30 s via on-demand revalidation + short revalidate window | Follow CLAUDE.md 3.1 J |
| D-12 | Dashboard options include "Update Banners" but the switch has no case for it | Banner management required (4.4) | Treat as an omission in the pseudocode |
| D-13 | Contact shows Phone and **Email** | Email optional | Include optional email field |
| D-14 | Security, SEO, accessibility mentioned only as goals | Detailed security, testing and SEO requirements | CLAUDE.md is more detailed; no conflict |
| D-15 | No mention of RLS, rate limiting, audit, CSP | Required | Additions from CLAUDE.md; no conflict |

No synopsis requirement conflicts with the approved stack.

## 6. Commands executed

- `node -v`, `npm -v`, `git --version`, `docker --version`, `docker info` (engine running)
- `git branch --show-current`, `ls`, `find` (inventory)
- `unzip -q <zip> -d /tmp/zorko-stitch-XXXX`, `cp -R` ×6, `diff -rq` (duplicate check), `rm -rf` of the duplicate root folder and the temp folder
- `cp` synopsis → `docs/source/synopsis.pdf`
- `sips` (PNG sizes), `wc -c`, `grep` (tokens, external scripts)
- `git add`, `git commit` (initial commit on `main`), `git switch -c phase-0`

## 7. Tests

| Check | Status | Notes |
|---|---|---|
| Existing build | NOT RUN | No `package.json`; nothing to build |
| Existing tests | NOT RUN | None exist |
| Lint / typecheck | NOT RUN | No code yet |
| File inventory matches 6.1 | PASS | 11 design files + synopsis + CLAUDE.md + settings |

## 8. Security checks and findings

- No `.env` files exist; `.gitignore` excludes `.env*` (except `.env.example`); `.claude/settings.json` denies reading `.env` files.
- No secrets in tracked files (manual review: only CLAUDE.md, synopsis, Stitch export, settings, .gitignore). Automated secret scan NOT RUN (gitleaks not installed).
- Stitch `code.html` files load remote scripts (Tailwind CDN) and Google-hosted images: treated as untrusted reference only; never shipped or executed in the app.

## 9. UI consistency checks

Not applicable in Phase 0 beyond the inventory above.

## 10. Known defects / unresolved issues

- None in code (no code yet).
- Open questions for the café/guide are collected in Phase 1 (`docs/OPEN_QUESTIONS.md`).

## 11. Documentation updates

- Created `docs/PROGRESS.md` and this report. PRD/TRD/etc. are Phase 1.

## 12. Gate evidence

- Baseline and unknowns documented (sections 3–5). `docs/PROGRESS.md` exists.

## 13. Self-verification

No running app in this phase. I checked the file inventory, PNG sizes, design tokens and Git state with the commands in section 6.

## 14. Next phase

Phase 1 — Requirements, architecture, design spec. Needs the exact approval phrase.

---

## HOW TO TEST THIS PHASE

1. **Commands**
   ```bash
   cd ~/projects/zorko-sangli
   git log --oneline --all          # expect the initial commit and the phase-0 commit
   git branch                       # expect main and phase-0
   find . -path ./.git -prune -o -type f ! -name .DS_Store -print | sort
   open docs/source/synopsis.pdf    # confirm it is the correct synopsis
   ```
2. **Manual checks**
   - The file list shows `CLAUDE.md`, `.gitignore`, `.claude/settings.json`, `docs/source/synopsis.pdf`, `docs/PROGRESS.md`, `docs/PHASE_REPORTS/phase-0.md` and 11 files under `design/stitch/`.
   - The synopsis that opens is the final version you submitted (signature page lists all three students).
   - The Stitch screen table in section 4 matches the zip you have.
   - The differences table in section 5 is correct, and you agree with assumptions A-01 to A-08 in `docs/PROGRESS.md` (or tell me which to change).
3. **Known limitations (not bugs):** there is no app to run yet; gitleaks and the Supabase CLI are not installed (not needed until later phases).
4. **If something is wrong:** send the command output or tell me which difference or assumption to change.

Phase 0 complete. Waiting for your approval or bug reports before starting Phase 1. To approve, reply exactly: approved, go to Phase 1
