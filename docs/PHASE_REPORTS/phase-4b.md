# Phase 4B — Public site remainder

**Status:** AWAITING TEAM VERIFICATION · **Branch:** `phase-4b` (pushed to GitHub `origin/phase-4b` per task, on the team's "push") · **Date:** 2026-10-15
**Approval of Phase 4A recorded:** 2026-10-14, "approved, go to Phase 4B" (merged to `main`, tag `phase-4a-approved`).

## 1. Requirements addressed

| Area | Delivered |
|---|---|
| Real outlet data (Q-01, Q-02, Q-06, Q-07) | Real Sangli menu imported from the printed menu: 65 items in 16 categories, real prices, pure-veg confirmed (ADR-044). Address and phone are verified. The team supplied the map coordinates and the Google Maps listing. Opening hours stay unconfirmed and labelled. |
| Menu photos (ADR-045) | 44 licence-checked, vegetarian, illustrative photos stored locally, each one matched by hand to its dish. A `/credits` page lists them; menu pages say "Photos are illustrative". The home hero now has a fixed burger photo (an admin banner will override it in 5C). |
| Offers & Combos (FR-014) | `/offers`: hero with a real "N active offers" count; tabs All / Combos / Item deals / Student (kept in the URL, work without JavaScript); sections for combos, deals, limited-time specials and "Starting soon"; terms; empty state. `/offers/[slug]`: price and saving, validity, "Active now" or "Starts …" badge, included dishes linking to the menu, not-found page. Expired and draft offers never appear. No coupon or ordering UI ("View details" replaces "Claim"). |
| Student Zone (FR-015) | `/student-zone`: the café's Student Zone text, a notice that the site does not verify student status, current and upcoming student offers, empty state, links to the menu and all offers. No student-ID check. |
| Gallery (FR-016) | `/gallery`: square-tile grid and a lightbox (previous/next, ←/→ wrap-around, Escape, captions, focus trap and restore). Shows "No photos yet" until admins publish photos (Phase 5C). |
| About & Contact (FR-017) | `/contact`: full address, phone/email/WhatsApp/Instagram/Facebook when set; "To be confirmed" labels on unverified values; Google map and "Get directions"; hours table with today highlighted (`aria-current`); about text; approved reviews; feedback button hidden until Phase 6. |
| Map and directions (ADR-046) | The map and directions use the Google Maps place ("Cafe Zorko, 100 Feet Rd, …"), then coordinates, then the verified address. Google therefore opens the business itself, not a bare point. An unverified placeholder address is never sent to Google. |
| SEO (FR-021, ADR-047) | Every page has a title, description, canonical URL and complete Open Graph/Twitter tags. Dish and offer pages share their own photo; other pages share a 1200×630 default image. `/sitemap.xml` lists live pages plus visible dishes and offers; `/robots.txt` disallows `/api/` and `/dev/`. Missing pages and `/credits` are `noindex`. |
| Navigation | All six public pages are live: header, tablet drawer, footer, and a mobile bottom nav (Home · Menu · Offers · Students · More, where More holds Gallery and About & Contact). |
| CI | GitHub Actions runs integration tests and seeded E2E. Visual baselines are macOS-only, so CI skips them. |

## 2. Files

- **New pages:** `src/app/(public)/{offers,offers/[slug],student-zone,gallery,contact,credits}/…`, `src/app/{sitemap,robots}.ts`
- **New components and logic:** `src/features/offers/offer-cards.tsx`, `src/features/gallery/gallery-grid.tsx`, `src/features/cafe/review-list.tsx`, `src/lib/site/seo.ts`, `src/server/services/sitemap.ts`, `src/lib/site/image-credits.json`
- **Data:** `prisma/data/sangli-menu.ts` (real menu and café), `prisma/import-menu.ts` (`npm run db:import-menu`), `prisma/fixtures/test-data.ts` (frozen test data), `prisma/demo-data.ts`, `public/stock/*` (44 photos), `public/og-default.jpg`
- **Migration:** `20261015120000_cafe_maps_query`. It only adds the nullable `CafeInformation.mapsQuery` column.
- **Modified:** `services/{offers,cafe}.ts`, `server/public-data.ts`, `lib/site/nav.ts`, the home and menu pages, `features/cafe/map-embed.tsx`, the layout footer and bottom nav
- **Tests:** `tests/e2e/public-site.spec.ts` (+ 10 new baselines), `tests/component/gallery-grid.test.tsx`, `tests/unit/menu-page.test.ts`, `tests/integration/api.test.ts`
- **Docs:** DECISIONS (ADR-043…047), TEST_PLAN, TRACEABILITY, UI_SPEC, OPEN_QUESTIONS, DEPLOYMENT, WORKLOG, PROGRESS

## 3. Decisions

- **ADR-043:** the demo menu is modelled on zorko.in names with our own wording and prices, and tests use frozen fixtures. So changes to the real menu never break tests.
- **ADR-044:** the real Sangli menu comes from the printed outlet menu. `db:import-menu` is create-only and refuses to run while demo items exist.
- **ADR-045:** illustrative photos are Commons-licensed (CC0/PD/CC BY/CC BY-SA), stored locally, vegetarian only, and credited on `/credits`.
- **ADR-046:** map and directions use the Google Maps place, then coordinates, then the verified address.
- **ADR-047:** SEO helper, request-time sitemap, robots. There is no JSON-LD until hours are confirmed.

## 4. Commands actually executed

```
npm run check ; npm run test:integration ; npm run test:supabase ; npm audit --omit=dev
npm run test:db:reset ; npx playwright test --project=chromium --workers=2 ; npx playwright test --project=webkit --workers=2
npx playwright test -g "visual baselines" --update-snapshots   (after reviewing each diff)
npm run db:migrate:deploy ; npm run db:import-menu             (development Supabase project only)
docker run zricethezav/gitleaks git /repo                       (before every push)
```

## 5. Test results

| Suite | Result |
|---|---|
| `npm run check` (lint, typecheck, format, unit + component, build) | **PASS**, 128 tests |
| Integration (local Postgres) | **PASS**, 70/70 |
| Supabase REST denial (dev project) | **PASS**, 34/34 (one "NOT RUN" placeholder skipped, as designed, because the keys are set) |
| E2E Chromium (production build) | **PASS**, 114/114, including 16 visual baselines |
| E2E WebKit | **PASS**, 100 passed; 14 skipped by design (visual baselines are Chromium-only) |
| `npm audit --omit=dev` | **PASS**, 0 vulnerabilities |
| gitleaks (full history) | **PASS**, no leaks |
| Lighthouse | **NOT RUN** (Phase 7) |

**Coverage added in 4B:**
- Offers: listing, tabs, details, not-found.
- Student Zone; gallery empty state and the mobile "More" sheet; contact.
- SEO tags, sitemap and robots.
- Map/directions rules (TC-INT-042) and the lightbox component test (TC-COMP-010).
- Keyboard-only navigation (TC-A11Y-003).
- Axe now runs at 390, **768** and 1440 px on all 11 public pages, including `/credits` and a scheduled offer.

## 6. Security and quality checks

- **External links and URLs:**
  - External links use `rel="noopener noreferrer"`.
  - The directions URL is built with `encodeURIComponent`, so an address containing `&` cannot add URL parameters (tested).
- **No leaks of hidden or unverified data:**
  - The sitemap reuses the pages' visibility rules: unpublished items and expired or draft offers never leak (tested).
  - An unverified address is never sent to Google (tested).
- **Unchanged, still tested:**
  - All text is rendered escaped; there is no `dangerouslySetInnerHTML`.
  - The CSP allows frames only from `https://www.google.com` (the map).
- **Database changes:** the migration is additive (one nullable column); no data was changed or deleted. It was applied only to the test database and the development project.
- **Git history:** at the team's request it was rewritten to remove the AI co-author lines. File contents were verified identical, and a full backup bundle was kept.

## 7. UI consistency

- **Derived screens:** Student Zone, gallery, contact and the offer details page follow UI_SPEC §12.4–12.8 with the same tokens and components. Every new screenshot was reviewed before it became a baseline.
- **Responsive checks:**
  - No horizontal scroll at 375/430/768/1024/1440 px on all pages.
  - Touch targets ≥ 48 px under 1024 px.
  - Tablet layouts (768/1024) checked by eye.
- **Mockup content handled as CLAUDE.md §6.2/6.3 require:** coupon codes, "Claim Combo Voucher", ratings and hygiene claims are not reproduced. Happy-hour and live-kitchen claims are not reproduced either.

## 8. Defects found during self-verification (all fixed, with tests)

1. **`/menu` read the current time while pre-rendering** (a Next.js error in the server log). Fixed with `connection()`.
2. **3 px horizontal overflow on `/offers` at 375 px.** The scheduled card needed `min-w-0`.
3. **Home hero showed a garlic bun** (the first popular dish's photo), reported by the team. It now uses a fixed burger photo.
4. **Map/directions issues, reported by the team:**
   - No map for the real data, because there were no coordinates.
   - Then directions led to a bare point and the map card said "Place couldn't load".
   - Fixed by ADR-046 (Google Maps place first).
5. **`/credits` links were 15–18 px tall** (axe `target-size`, TC-RESP-002). They are now 48 px targets.
6. **The contact baseline would have failed daily**, because the "today" row moves. The hours table is masked in screenshots.
7. **Test robustness:**
   - A WebKit navigation race in the offer-details test.
   - Ambiguous locators ("All" also matched "Gallery").
   - Safari's Tab key skips links, so the test uses Option+Tab in WebKit.

## 9. Known limitations (not bugs)

- **Opening hours** are still placeholders labelled "to be confirmed" (Q-05). WhatsApp, email and social links are not set (Q-03/Q-04), so they don't show.
- **The gallery is empty** until Phase 5C admin uploads; the lightbox has a component test, and gets an E2E run once photos exist.
- **Offers in your dev database** are the demo offers from Phase 3, labelled as demo. Real offers come with the offers admin (5C) or from the café (Q-07).
- **The embedded Google map** shows Google's own place card (rating, "Open in Maps"). That content comes from Google; this site makes no rating claims.
- **This Mac runs under very high load** (the Bluetooth daemon at about 97 % CPU). E2E is reliable with `--workers=2`; with 4 workers, static files can time out. The team's machines may not have this problem.
- **Visual baselines are macOS-only** (`-darwin`), as in 4A.

## 10. Gate evidence

Every public page (home, menu, item, offers, offer details, Student Zone, gallery, contact, credits) works end to end against the database. Each passes functional, accessibility (axe at three widths plus keyboard), responsive (five widths) and visual checks in two browser engines. SEO metadata, sitemap and robots are in place and tested.

---

## HOW TO TEST THIS PHASE

**1. Get the code and update your dev database** (Docker is not needed for this part):
```bash
git fetch origin && git switch phase-4b && git pull
npm ci
npm run db:migrate:deploy     # adds one optional column (mapsQuery); changes no data
npm run db:import-menu        # fills in the Google Maps place if it is missing; never overwrites
npm run dev                   # http://localhost:3000
```
To test on a phone on the same Wi-Fi, run `npm run dev -- -H 0.0.0.0` and open `http://<your-laptop-IP>:3000`.

**2. What you should see:**
- **Home:** a burger photo in the hero, "65 items on the menu", "View Offers" and "Explore Student Zone" buttons, and a "Visit" section with the map and Get directions.
- **`/offers`:** the active-offers count, tabs, combo/deal cards with "Save ₹…", and a "Starting soon" offer.
- **`/student-zone`:** the student notice and student offers.
- **`/gallery`:** "No photos yet".
- **`/contact`:** address, phone, map with the Cafe Zorko pin, and the hours table.

**3. Manual checks:**
1. On `/offers`, click **Student**: the URL becomes `?tab=student` and only student offers show. Open an offer, then click an included dish: you land on that dish's menu page.
2. On `/contact`, click **Get directions**: Google Maps opens with **Cafe Zorko, 100 Feet Rd** as the destination. Click the **phone number**: on a phone it starts a call.
3. On a phone-sized window (about 390 px): the bottom bar shows Home · Menu · Offers · Students · More. **More** opens a sheet with Gallery and About & Contact. Nothing scrolls sideways.
4. Open `http://localhost:3000/sitemap.xml`: it lists the 6 pages, every dish and the current offers. `/robots.txt` shows `Disallow: /api/`.
5. Keyboard only: on `/offers` press **Tab** first (Safari: **Option+Tab**). A "Skip to content" link appears; tabs and cards can be reached and opened with Enter.

**4. Automated** (Docker Desktop running):
```bash
npm run check                                # PASS, 128 tests
npm run test:integration                     # 70 passed
npm run test:db:reset && npx playwright test --workers=2   # 214 passed, 14 skipped
```

**Not bugs:**
- Hours say "(to be confirmed)".
- The gallery is empty.
- Offers are labelled demo.
- The map card shows Google's rating.
- WhatsApp, email and social links are absent until the café supplies them.

**If something fails, send:** the URL, the screen width, a screenshot, and any red errors from the browser console (F12 → Console).

Phase 4B complete. Waiting for your approval or bug reports before starting Phase 5A. To approve, reply exactly: approved, go to Phase 5A
