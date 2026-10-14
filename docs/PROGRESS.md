# PROGRESS — ZORKO Sangli Smart Café Digital Platform

Single source of truth for project state (CLAUDE.md Section 0.1).

**Resuming after an interruption?** Read `docs/WORKLOG.md` → "RESUME HERE". It records the last completed task and the exact next action, and is updated after every task.

## Current phase

| Field | Value |
|---|---|
| Current phase | **Phase 4B — Public site remainder** |
| Status | **IN PROGRESS** |
| Branch | `phase-4b` |
| Latest report | `docs/PHASE_REPORTS/phase-4a.md` |
| Last updated | 2026-10-14 |

## Approved phases

| Phase | Date | Approval message (quoted) |
|---|---|---|
| Phase 0 | 2026-10-13 | "approved, go to Phase 1" |
| Phase 1 | 2026-10-13 | "approved, go to Phase 2" |
| Phase 2 | 2026-10-13 | "approved, go to Phase 3" |
| Phase 3 | 2026-10-14 | "approved, go to Phase 4A" |
| Phase 4A | 2026-10-14 | "approved, go to Phase 4B" |

## Open bugs

None.

## Deferred backlog (outside current phase scope)

- Loyalty and Reward Program: future work (synopsis methodology lists it as future expansion). Confirm with guide.
- Online ordering, payment, customer accounts, delivery/order tracking: future work (synopsis + CLAUDE.md 3.0).
- Secret scanning: gitleaks runs via Docker (`ghcr.io/gitleaks/gitleaks`); CI uses gitleaks-action once a GitHub remote exists (Q-16).
- Re-check dev-only advisory `braces` ≤3.0.3 each phase; adopt the patched release when published (ADR-032).
- Team machine: `~/.npm` cache has root-owned files; fix with `sudo chown -R $(whoami) ~/.npm` (ADR-030).
- Visual regression baselines start in Phase 4A.
- Finalise CSP script policy in Phase 7 (ADR-016).
- Remove the `deepmerge-ts` / `mysql2` npm overrides once Prisma ships patched dependencies (ADR-036, review in Phase 7).
- Page-level caching + on-demand revalidation (≤30 s freshness) is designed with the pages in 4A/5B (ADR-035).
- Real menu, prices, hours, address and offers: still demo placeholders (Q-01…Q-08).
- Visual baselines exist only for macOS (`-darwin`); record Linux baselines when CI is set up (Q-16).
- Switch on `/offers`, `/student-zone`, `/gallery`, `/contact` in `src/lib/site/nav.ts` in Phase 4B, and `/feedback`, `/qr` in Phase 6 (ADR-042).
- Admin actions must call `updateTag`/`revalidateTag` for the `menu`/`offers`/`cafe`/`home`/`item:<slug>` tags (Phase 5B/5C, ADR-040).

## Assumptions waiting for team confirmation

Phase 1 approval (2026-10-13) did not comment on A-09…A-11 / Q-19; they are applied as proposed and remain open for objection.

See `docs/PHASE_REPORTS/phase-0.md` → "Synopsis vs CLAUDE.md differences". In short:

1. A-01: Loyalty/Reward program is out of scope for this release.
2. A-02: Admin login uses Supabase Auth (email + password) plus an `AdminUser` allowlist, not a username/password table as in the pseudocode.
3. A-03: Menu "Delete" is soft-archive by default; hard delete only for unreferenced records.
4. A-04: "Frequently Bought Together" = admin-managed item associations; combos are shown separately as offers.
5. A-05: Public "customer reviews" = moderated feedback submitted through the site (no ratings, no imported reviews).
6. A-06: "Customer Gallery" = admin-uploaded gallery photos (no customer photo uploads).
7. A-07 (revised in Phase 1): Homepage shows up to **4** trending/best-seller items to match the design grid (ADR-023; synopsis says 5).
8. A-08: Synopsis copy used: `~/Downloads/MINI PROJECT SYN (2).pdf` (chosen by the team on 2026-10-13).
9. A-09: Primary button hover uses `#d1430a` instead of Stitch `#E64A19` for WCAG AA contrast (ADR-004).
10. A-10: Header fixes to the Stitch design: sticky header, no-wrap nav, drawer at 768–1279 px (ADR-024).
11. A-11: Feedback has no star ratings (ADR-026, Q-11).

Full list of information needed from the café/team: `docs/OPEN_QUESTIONS.md` (Q-01…Q-20).
