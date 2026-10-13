# Phase 1 — Requirements, architecture, design spec

**Status:** AWAITING TEAM VERIFICATION
**Date:** 2026-10-13
**Branch:** `phase-1` (local; from `main` after the `phase-0-approved` tag)

## 1. Requirements addressed

CLAUDE.md §12 Phase 1:
- write the PRD, TRD, UI_SPEC, SECURITY (initial threat model), TEST_PLAN, TRACEABILITY, DEPLOYMENT, DECISIONS and OPEN_QUESTIONS;
- resolve the gaps between the synopsis and the implementation;
- confirm the Stitch token decisions;
- render Stitch references into `design/reference/`;
- list the derived screens;
- include Mermaid architecture and data-flow diagrams.

## 2. Files created / modified

| File | Content |
|---|---|
| `docs/PRD.md` | Objectives, 5 personas, 14 user stories, **46 FR + 12 NFR** with priorities and testable acceptance criteria, scope, journeys, sitemap, assumptions, risks, Definition of Done |
| `docs/TRD.md` | Stack rationale, architecture + 2 sequence diagrams + ER diagram + deployment diagram (5 Mermaid diagrams), module map, 16-model schema, API contracts, auth design, validation, env vars, storage, logging, backups, trade-offs |
| `docs/UI_SPEC.md` | Tokens, contrast table, typography, spacing, radii, elevation, components, veg indicator, navigation, Lucide icon map, imagery, motion, page layouts (public + admin), 11 deviations, 30 derived screens, component inventory, responsive matrix |
| `docs/SECURITY.md` | Assets, trust boundaries, attack surface, actors, 16 abuse cases, STRIDE, 11-risk register, OWASP Top 10:2025 and API Top 10:2023 checklists |
| `docs/TEST_PLAN.md` | Pyramid, test data, entry/exit criteria, severity rules, **118 test cases** with IDs, commands |
| `docs/TRACEABILITY.md` | Every FR/NFR → module → planned location → tests → phase → status |
| `docs/DEPLOYMENT.md` | Environments, env vars and where to find them, setup, DB, first-admin provisioning, storage, backups, rollback, rotation, demo checklist |
| `docs/DECISIONS.md` | ADR-001…ADR-027 |
| `docs/OPEN_QUESTIONS.md` | Q-01…Q-20 with defaults and blocking phase |
| `design/reference/*.png` | 5 Playwright renders (4 × 1440 px desktop, 1 × 390 px mobile) |
| `README.md` | Project intro and documentation index |
| `docs/PROGRESS.md` | Phase 0 approval recorded; Phase 1 status |

## 3. Key decisions (details in DECISIONS.md)

- **Tokens:** CLAUDE.md 6.1 conflict confirmed. YAML/Tailwind values are used (`#a93200` primary); `#F15A24` is glow only (ADR-003).
- **Radii:** the `code.html` radii equal Tailwind v4 defaults, so no override is needed (ADR-005).
- **New finding — hover colour:** the Stitch hover `#E64A19` with white button text is **3.92:1** (fails AA). Proposed hover is `#d1430a` (4.65:1) (ADR-004).
- **New findings — Stitch header defects** at 1440 px: nav labels wrap, and the fixed info bar overlaps content. Fixes are proposed in ADR-024.
- **Versions:**
  - npm's `latest` tag for **Prisma is a release candidate (8.0.0-rc.22) needing Node ≥22.18**. We pin stable Prisma 7.10.0, which is compatible with the dev machine's Node 22.13.1 (ADR-002).
  - TypeScript `latest` is 7.0; compatibility with Next.js will be checked in Phase 2 before pinning.
- **Trending count:** 4 instead of 5, to match the design grid (ADR-023; changes assumption A-07).
- **Data model:** offers use one table with `DISCOUNT`/`COMBO`/`INFO` kinds and a computed status (ADR-020); money is stored in integer paise (ADR-008).
- **Security:** RLS deny-all + `REVOKE` on all tables (ADR-009); `requireAdmin()` in every operation (ADR-010); Origin checks on Route Handlers (ADR-011); Postgres rate limiter (ADR-014); uploads checked by magic bytes and re-encoded with sharp (ADR-015).

## 4. Synopsis vs implementation gaps — resolved

All 15 differences from the Phase 0 report (D-01…D-15) are mapped:
- **D-01** Loyalty: out of scope (Q-12).
- **D-02** Login: Supabase Auth + allowlist (ADR-010).
- **D-03** Delete: soft-archive (FR-034/035).
- **D-04** "Frequently bought together": ItemRelation + combos (FR-012).
- **D-05** Reviews: moderated feedback (FR-019/020, ADR-026).
- **D-06** Gallery: admin-uploaded (FR-043).
- **D-07** Extra admin modules (FR-043…045).
- **D-08** DB filtering (ADR-012).
- **D-09** Trending: 4 (ADR-023).
- **D-10** Popular / offer filters (ADR-021, FR-005).
- **D-11** Freshness (ADR-013).
- **D-12** Banners (FR-041).
- **D-13** Email (FR-017).
- **D-14/15** Added by CLAUDE.md, no conflict.

## 5. Commands actually executed

- `git commit` (Phase 0 approval record), `git merge --no-ff phase-0` into `main`, `git tag phase-0-approved`, `git switch -c phase-1`.
- `python3 -I /tmp/zorko-tools/outline.py …`: structural outline of all 5 `code.html` files (read-only parse; no scripts executed).
- Inline-script review of every `code.html` (all are demo UI scripts: fake cart, coupon copy, tab filter; nothing harmful).
- `npm install --cache /tmp/zorko-tools/.npm-cache playwright-core` in `/tmp/zorko-tools` (outside the repo; no project dependency added).
- `node /tmp/zorko-tools/render.js` produced the 5 renders. Tailwind loaded and there were **0 failed requests** on every screen. Heights: home 3795, menu 2439, item details 2349, offers 3186 (all 1440 px wide), mobile offers 2962 (390 px wide).
- `npm view <pkg> version/engines/dist-tags` for 16 packages (registry lookup only).
- `python3 -I /tmp/zorko-tools/contrast.py`: WCAG contrast for 31 colour pairs.
- An ID cross-check script, which found **0** undefined test/ADR/question references and all 58 requirements present in TRACEABILITY.
- `node /tmp/zorko-tools/mermaid-check.js`: rendered all 5 Mermaid diagrams with mermaid 11. The first run found a parse error in the ER diagram (`to` is reserved); it was fixed and the re-run gave 5/5 ok.

## 6. Tests

| Check | Status | Notes |
|---|---|---|
| Stitch reference renders | PASS | 5/5 rendered, 0 failed network requests |
| Mermaid diagrams render | PASS | 5/5 after one fix |
| Document cross-references (test IDs, ADRs, Qs, FR/NFR coverage) | PASS | Scripted check |
| Contrast calculations for the token table | PASS | 31 pairs computed; failing pairs restricted in UI_SPEC §2.3 |
| Unit / integration / E2E / lint / build | NOT RUN | No code in Phase 1 (begins Phase 2) |
| Secret scan (gitleaks) | NOT RUN | Not installed; manual review only: no secrets in any new file |

## 7. Security checks and findings

- Initial threat model written (SECURITY.md). No code, so no security tests ran.
- The Stitch HTML was treated as untrusted. Its scripts were read first, then the pages were rendered only in a headless browser with a throwaway profile. Nothing from the files was executed on the host.
- No `.env` files were read or created. No secrets appear in any document.

## 8. UI consistency checks

- Every class value in UI_SPEC was taken from the `code.html` outlines or the Tailwind config in their `<head>`.
- Mockup content and features to be removed (CLAUDE.md 6.2/6.3) are mapped page by page in UI_SPEC §12 and summarised in §14.
- The reference renders were inspected visually (home 1440 px, mobile offers 390 px). On the mobile full-page capture, the fixed bottom nav and toast appear mid-page; this is a full-page-screenshot side effect, not part of the layout.

## 9. Known issues / unresolved

- Exact library pins happen in Phase 2 (TypeScript 7 and ESLint 10 compatibility still unverified).
- The CSP script policy is deferred to Phase 7 (ADR-016, risk R-07).
- Café facts are all unknown (Q-01…Q-10). Placeholders and demo data will be clearly labelled.

## 10. Gate evidence

- **Requirements testable:** every FR/NFR has acceptance criteria and ≥1 test ID (TRACEABILITY).
- **Architecture justified:** TRD §1 rationale and §13 trade-offs; DECISIONS has 27 ADRs.
- **Security decisions documented:** SECURITY.md, ADR-009…011, 014…016.
- **Design spec established:** UI_SPEC.md plus `design/reference/`.

## 11. Self-verification

There is no running app in this phase. I opened and visually checked two reference renders (home desktop, offers mobile), rendered every Mermaid diagram, and ran the ID and contrast scripts listed in §5.

## 12. Next phase

Phase 2 — Application foundation (Next.js + TypeScript + Tailwind scaffold, tokens, fonts, core components, env validation, health endpoint, lint/test tooling, style preview page). Needs the exact approval phrase.

---

## HOW TO TEST THIS PHASE

1. **Commands**
   ```bash
   cd ~/projects/zorko-sangli
   git switch phase-1
   git log --oneline -5
   ls docs design/reference
   open design/reference/*.png          # compare with design/stitch/*/screen.png
   ```
   To see the Mermaid diagrams rendered, open `docs/TRD.md` in VS Code with a Mermaid preview extension, or paste a block into https://mermaid.live.
2. **Manual checks**
   - **UI_SPEC §12 and §14:** for each Stitch page, check you agree with what is kept, replaced and removed (especially the homepage hero tiles, the "QR Menu" header button, and the read-only add-ons on item details).
   - **DECISIONS ADR-004, ADR-023, ADR-024, ADR-026** (hover colour, 4 trending items, header fixes, no star ratings): confirm or object (Q-19).
   - **PRD §5:** confirm the requirement list and priorities match what your guide expects from the synopsis.
   - **OPEN_QUESTIONS:** answer what you already know (Q-06 pure veg, Q-09 logo permission, Q-11 ratings, Q-14 MFA, Q-16 GitHub). Nothing there blocks Phase 2.
   - The renders in `design/reference/` look like the Stitch screens (the fonts and images loaded).
3. **Known limitations (not bugs):** no app yet; library versions are planned, not installed; the Stitch nav wrapping visible in the 1440 px render is a defect in the design itself (fixed in ADR-024).
4. **If something is wrong:** tell me the document and section (for example "UI_SPEC §12.1 item 2") and what you want changed.

Phase 1 complete. Waiting for your approval or bug reports before starting Phase 2. To approve, reply exactly: approved, go to Phase 2
