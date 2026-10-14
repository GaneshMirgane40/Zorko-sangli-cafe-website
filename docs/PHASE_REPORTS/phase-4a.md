# Phase 4A — Public site core

**Status:** AWAITING TEAM VERIFICATION · **Branch:** `phase-4a` (local, not pushed) · **Date:** 2026-10-14
**Approval of Phase 3 recorded:** 2026-10-14, "approved, go to Phase 4A" (merged to `main`, tag `phase-3-approved`).

## 1. Requirements addressed

| Area | Delivered |
|---|---|
| Homepage `/` (FR-001, UI_SPEC §12.1) | Hero (today's hours chip, H1, View Menu CTA, feature tiles, image card, real "N items on the menu" count); facts strip (combos-from price, hours); categories with real counts; up to 4 popular picks; featured combo; Student Zone teaser; visit-us card with hours. Banner, review and gallery sections render only when that data exists. A map renders only when coordinates are set. |
| Digital menu `/menu` (FR-003…009) | Search (Enter, or 300 ms after typing); category list and mobile pills; Popular / Offers-only / price bands (Under ₹100, ₹100–₹200, ₹200+); sort; grid/list toggle; removable filter chips and "Clear all"; "Showing N items" (live region); pagination; skeleton, empty and error states. All state lives in the URL. Every filter combines on the server. Works without JavaScript. |
| Item details `/menu/[slug]` (FR-010…012) | Breadcrumb; "Back to menu" that restores the previous filters; image panel with zoom lightbox and thumbnails; price and availability; add-ons as read-only information ("ask at the counter"); frequently bought together; related items; combos with this item; active discount note; friendly not-found page. |
| Best sellers / trending (FR-013) | Admin flags drive the badges and the popular section. No invented statistics. |
| Header / footer / navigation (FR-002, UI_SPEC §8) | Sticky header, info bar (address placeholder, today's hours), desktop nav pills, tablet drawer, mobile bottom nav, header search, footer with weekly hours. The demo-data ribbon shows while café data is demo. Pages from later phases are not linked yet (ADR-042). |
| Mobile layouts | Compact 2-column cards, pill row, filter bottom sheet, compact header + bottom nav. Derived from the same tokens. |
| No ordering UI | No add/cart/order/quantity controls anywhere (tested). |

## 2. Files

- **New:**
  - Pages: `src/app/(public)/{layout,error,page}.tsx`, `menu/{page,loading}.tsx`, `menu/[slug]/{page,not-found}.tsx`
  - Layout: `src/components/layout/*` (header, footer, nav links, drawer, bottom nav, logo, demo ribbon)
  - Features: `src/features/menu/*` (card, controls, params, gallery, back link, skeletons, icons), `src/features/cafe/{hours,map-embed}.*`
  - Server and lib: `src/lib/site/nav.ts`, `src/server/public-data.ts`, `src/server/services/home.ts`
  - Tests: `tests/unit/menu-page.test.ts`, `tests/component/menu-card.test.tsx`, `tests/e2e/public-site.spec.ts` plus 6 baselines
- **Modified:**
  - `src/app/page.tsx` moved into `(public)`
  - Dialog (`placement="sheet"`) and SearchField (`onValueChange`, `inputId`)
  - `src/lib/format.ts` (12-hour times, IST dates), the `price` band in validation and service
  - The Phase 2 home E2E test (placeholder heading → real heading; deliberate)
  - A component-test fixture (`<a>` → `Link`)
  - The integration test for `price`
  - Docs: TRD, UI_SPEC (V-15…V-17), DECISIONS (ADR-040…042, ADR-013 accepted), TEST_PLAN, TRACEABILITY

## 3. Decisions

- **ADR-040 — data loading.** Public pages render at request time and read through `'use cache'` loaders (30 s, tagged `menu`/`offers`/`cafe`/`home`/`item:<slug>`). So:
  - `next build` never touches the database;
  - data is at most about 30 s old;
  - Phase 5B admin actions can refresh it immediately by tag.
- **ADR-041 — missing items.** Under partial prerendering, missing item pages show the friendly not-found UI with `noindex`, but HTTP 200, because Next.js has already sent the shell. I tried `instant = false`; it did not change this. The JSON API keeps real 404s.
- **ADR-042 — no dead links.** Navigation has per-page `live` flags, so no phase shows links to pages that don't exist yet.

## 4. Commands actually executed

```
npm run test:db:reset ; npx next build ; next start (port 3200, test DB) + Playwright screenshots at 1440/390 (manual review)
npm run check ; npm run test:integration ; npm run test:supabase ; npm run test:e2e
npx playwright test --update-snapshots=missing   (first recording of the 6 baselines)
grep scan of .next/static ; npm audit --omit=dev
```

## 5. Test results

| Suite | Result |
|---|---|
| `npm run check` (lint, typecheck, format, unit + component, build) | **PASS**, 118 tests (17 new) |
| Integration (local Postgres) | **PASS** 66/66 (+1: price bands) |
| Supabase REST denial (dev project) | **PASS** 34/34 |
| E2E, Chromium + WebKit, production build | **PASS** 132 passed; 6 skipped by design (visual baselines are Chromium-only) |
| Visual baselines (home, menu, item × desktop 1440 / mobile 390) | **PASS**: recorded and compared on re-run. These are the *first* baselines, recorded from this build; they guard against regressions from now on. Compared to Stitch by eye, not by pixel diff. |
| Lighthouse | **NOT RUN** (Phase 7) |

## 6. Security and quality checks

- **Rendering:** all user and admin text is rendered as escaped text; there is no `dangerouslySetInnerHTML` (lint rule).
- **Links:**
  - External links (social, WhatsApp, directions) use `rel="noopener noreferrer"`.
  - The "Back to menu" URL from sessionStorage is accepted only if it matches `^/menu(?…)`, so there is no open redirect.
- **Invalid URL params** on pages are dropped, not echoed or errored.
- **Client bundle scan:** 0 matches. **`npm audit --omit=dev`:** 0.

## 7. UI consistency

- I compared screenshots at 1440 and 390 px against the Stitch renders. The structure, tokens, spacing, radii and component styles follow UI_SPEC §7, §8 and §12.
- The deliberate differences are the ones listed in UI_SPEC §14 (mockup claims removed, the QR/Offers links hidden until their pages exist, the "Offer" badge instead of per-item struck-through prices).
- **Checked:**
  - axe: 0 serious/critical violations on all 3 pages at 390 and 1440 px;
  - no horizontal scroll at 375/430/768/1024/1440;
  - touch targets ≥ 48 px under 1024 px;
  - dialog focus is trapped and restored.

## 8. Defects found during self-verification (all fixed, with tests)

1. **"View details" showed on the compact mobile card.** `cn()` doesn't merge classes, so `inline-flex` beat `hidden`. Wrapped in a responsive span; covered by the visual baseline.
2. **The build failed.** `usePathname()` outside Suspense blocked prerendering of `/menu/[slug]`. The nav components now stream their active state.
3. **Breadcrumb links were under 48 px on mobile.** Fixed (V-17); TC-RESP-002.
4. **Missing item pages returned 200.** Investigated and documented (ADR-041); the test now asserts the not-found UI and `noindex`.
5. **WebKit test flakiness.** Tests interacted before hydration. Tests now wait for network idle; real users can always submit with Enter.

## 9. Known limitations (not bugs)

- Offers, Student Zone, Gallery, About/Contact (Phase 4B) and Feedback/QR (Phase 6) pages don't exist yet, so they aren't linked anywhere.
- All content is demo data. Hours, address and prices are labelled placeholders.
- No reviews or gallery images exist yet, so those home sections are hidden.
- Visual baselines are macOS (`-darwin`) files. A Linux CI run will need its own set (backlog).
- A change made directly in the Supabase table editor can take up to ~30 s plus one refresh to show (cache window). Admin-made changes (Phase 5B) will refresh immediately.

## 10. Gate evidence

All core public pages work end to end against real database data, match the UI spec, and pass functional, accessibility, responsive and visual checks in two browser engines.

---

## HOW TO TEST THIS PHASE

**1. Run against your Supabase dev project** (already migrated and seeded in Phase 3):
```bash
git switch phase-4a
npm ci
npm run dev        # http://localhost:3000
```
To test on a phone on the same Wi-Fi, run `npm run dev -- -H 0.0.0.0` and open `http://<your-laptop-IP>:3000`.

**2. What you should see:**
- `/`: hero "Hungry? Bite Into Joy at ZORKO Sangli!", a dark "Demo data" ribbon, "16 items on the menu", 6 category tiles, 4 popular picks, the featured combo and a Student Zone card.
- `/menu`: 16 items on 2 pages, filters on the left (desktop), or pills and a Filters button (phone).
- `/menu/classic-veg-burger`: details, "Customisations available — ask at the counter", frequently bought together, related items and the combo.

**3. Manual checks:**
1. On `/menu`, type `burger` in the search, click the **Burgers** category, and choose **₹100–₹200**. Only *Paneer Tikka Burger* and *Double Cheese Burger* should show. Remove one chip; the others stay applied.
2. Tick **Offers only** → 6 items. **Reset** → all 16.
3. Open the second page → *Double Cheese Burger* and *Chocolate Shake* show **Out of stock** with a greyed image.
4. Open any item from a filtered menu and press **Back to menu**: your filters return.
5. In Supabase's Table Editor, set `isAvailable = false` on *French Fries*. Within about 30 seconds (refresh the page), it shows **Out of stock**. Set it back afterwards.
6. On a phone or a narrow browser (about 390 px): bottom nav (Home, Menu), 2-column cards, and a Filters sheet with Apply/Reset. No sideways scrolling.

**4. Automated** (Docker Desktop running):
```bash
npm run check              # PASS, 118 tests
npm run test:integration   # 66 passed
npm run test:e2e           # 132 passed, 6 skipped
```

**Not bugs:** the Offers, Student Zone, Gallery, Contact, Feedback and QR links are missing on purpose until their phases; all data is demo; "(to be confirmed)" marks unverified hours.

**If something fails, send:** the URL, the screen width, a screenshot, and any red errors from the browser console (F12 → Console).

Phase 4A complete. Waiting for your approval or bug reports before starting Phase 4B. To approve, reply exactly: approved, go to Phase 4B
