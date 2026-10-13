# DECISIONS — Architecture Decision Log

Format: ID · decision · alternatives · rationale · consequences. Status: **Accepted** (in force), **Proposed** (awaiting team confirmation), **Deferred** (decided in a later phase).

---

## ADR-001 Package manager: npm — Accepted
- **Alternatives:** pnpm, yarn (neither installed).
- **Rationale:** CLAUDE.md rule 25; npm 11.19.1 is installed; no existing lockfile.
- **Consequences:** `package-lock.json` is committed; CI uses `npm ci`.

## ADR-002 Runtime and library versions — Proposed (pinned in Phase 2)
Versions looked up on the npm registry on 2026-10-13. Exact pins are written into `package.json` in Phase 2 after a clean install, lint, typecheck and build succeed; this table is then updated.

| Component | Planned | Notes |
|---|---|---|
| Node.js | 22.x LTS (dev machine: 22.13.1) | Next 16 needs ≥20.9; Prisma 7 needs ^20.19 / ^22.12 / ≥24; Vitest 5 needs ^22.12. Recommend the team keeps Node ≥22.13 (Node 24 LTS also fine). |
| Next.js | 16.4.x (App Router) | Next 16 renames `middleware.ts` to `proxy.ts`; check the docs in Phase 2. |
| React | 19.x | Peer of Next 16. |
| TypeScript | 5.9.x or 6.x unless 7.x is confirmed compatible | npm `latest` is 7.0.2 (native compiler). Use it only if `next build` and ESLint type-aware rules work with it. |
| Tailwind CSS | 4.3.x | CSS-first config (`@theme` in CSS), no `tailwind.config.js` needed. |
| Prisma (CLI + client) | **7.10.0 (stable)** | npm `latest` tag points at **8.0.0-rc.22**, a release candidate that also needs Node ≥22.18. Do not use RCs. Prisma 7 uses `prisma.config.ts` for connection URLs and a driver adapter (`@prisma/adapter-pg`). |
| @supabase/ssr | 0.12.x | Cookie-based server client; use `getClaims()`/`getUser()` for validation. |
| @supabase/supabase-js | 2.x | |
| Zod | 4.x | |
| Vitest | 5.x | |
| Playwright (@playwright/test) | 1.64.x | Chromium + WebKit projects. |
| @axe-core/playwright | 4.x | Accessibility checks. |
| lucide-react | latest 1.x | Icons (CLAUDE.md Section 5). |
| qrcode | 1.5.x | Server-side QR SVG/PNG generation. |
| ESLint | 9.x or 10.x, whichever `eslint-config-next` 16 supports | |

## ADR-003 Colour tokens: YAML/Tailwind values, not DESIGN.md prose — Accepted (CLAUDE.md 6.1, confirmed)
- **Decision:** primary `#a93200`, primary-container `#d1430a`, secondary-container `#fcb812`, tertiary `#006947`, veg green `#15803D`, plus the full YAML palette (see `UI_SPEC.md` §2). `#F15A24` is used only for decorative glows and shadows (for example the `rgba(241,90,36,…)` shadows in `code.html`).
- **Rationale:** the YAML block, all 5 `code.html` Tailwind configs and the rendered pixels use `#a93200`. White on `#a93200` = 6.68:1 (AA); white on `#F15A24` = 3.37:1 (fails AA for normal text).

## ADR-004 Primary button hover colour: `#d1430a` instead of `#E64A19` — Proposed
- **Problem:** `code.html` uses `hover:bg-culinary-orange-deep` (`#E64A19`) under white `label-lg` (14 px bold) text. Measured contrast is **3.92:1**, which fails WCAG AA for normal text (14 px bold is not "large text").
- **Decision:** primary buttons hover to `primary-container` `#d1430a` (white text 4.65:1, AA). `#E64A19` stays available for non-text accents (icons on light backgrounds, borders, decorative gradients).
- **Alternatives:** keep `#E64A19` (fails AA); darken on hover (inverts the design's "brighter on hover" feel).
- **Consequence:** visually very close to the design (both are warmer/brighter than `#a93200`). Documented in `UI_SPEC.md` §2.3.

## ADR-005 Radii: use the radii actually used in `code.html` — Accepted
- **Conflict:** YAML `rounded` (DEFAULT 0.5rem, lg 1rem, xl 1.5rem) vs the `code.html` Tailwind config (DEFAULT 0.25rem, lg 0.5rem, xl 0.75rem).
- **Decision:** follow `code.html` per component. Its config equals Tailwind v4's defaults for `rounded`, `rounded-lg`, `rounded-xl` (0.25/0.5/0.75 rem), and it uses Tailwind defaults for `rounded-md` (0.375rem), `rounded-2xl` (1rem) and `rounded-3xl` (1.5rem). So we keep **Tailwind v4 default radii** and do not override them.
- **Check:** this also matches DESIGN.md prose: inputs 12 px (`rounded-xl`), cards 16–24 px (`rounded-2xl`/`rounded-3xl`), pills `rounded-full`. Usage counts across the 5 screens: full 261, xl 91, 2xl 75, lg 18, 3xl 12, md 10.

## ADR-006 Icons: Lucide instead of Material Symbols — Accepted
- **Rationale:** CLAUDE.md Section 5 prescribes Lucide; Stitch loads Material Symbols from Google Fonts (would be a remote dependency). A mapping table is in `UI_SPEC.md` §9.
- **Consequence:** Lucide no longer ships brand logos (Instagram/Facebook). Social links use generic icons plus text labels, which is also more accessible.

## ADR-007 Fonts: Sora + Plus Jakarta Sans via `next/font/google` (self-hosted at build) — Accepted
Weights used in `code.html`: Sora 600/700/800; Plus Jakarta Sans 400/500/700/800. `next/font` downloads them at build time and serves them from our own origin (no runtime request to Google).

## ADR-008 Money as integer paise — Accepted
All prices are stored as `Int` paise (₹1 = 100 paise) and formatted as `₹149` (no space, per DESIGN.md). Avoids floating point; Postgres `integer` covers up to ₹21 million per value.

## ADR-009 Authorization lives in server code; Supabase RLS is deny-all — Accepted (CLAUDE.md Section 5)
Prisma connects as a privileged role and bypasses RLS. A hand-written SQL migration enables RLS on every table in `public` (including `_prisma_migrations`) with **no** policies, and additionally `REVOKE ALL` on those tables from `anon` and `authenticated`. As a result, the auto-generated Supabase REST/GraphQL API returns nothing or a permission error. Tested in Phase 3 (TC-SEC-020).

## ADR-010 Admin identity: Supabase Auth email + password + `AdminUser` allowlist — Accepted
- Differs from the synopsis pseudocode (`VerifyCredentials(Database, Username, Password)`), which implies storing credentials in the app database. Supabase handles password hashing; the app stores only the Supabase user ID in `AdminUser`.
- Public signup is disabled in the Supabase dashboard. The first admin is created in the dashboard and allowlisted by a server-side script (`DEPLOYMENT.md` §6).
- Every admin Server Action and Route Handler calls `requireAdmin()`, which validates the JWT (`getClaims()`, falling back to `getUser()`) and checks `AdminUser.isActive`. The proxy only refreshes the session and redirects; it is never the only check.

## ADR-011 Admin mutations via Server Actions; uploads and public writes via Route Handlers with Origin checks — Accepted
- Server Actions get Next.js's built-in Origin/Host comparison (CSRF protection) and are POST-only. Each action still calls `requireAdmin()` and validates its input with Zod.
- Route Handlers that change state (`POST /api/v1/feedback`, `POST /api/admin/uploads`, `POST /api/admin/logout`) explicitly check that `Origin` matches `NEXT_PUBLIC_SITE_URL` (or the dev origin) and reject otherwise (403).
- Session cookies: `HttpOnly`, `Secure` in production, `SameSite=Lax` (set by `@supabase/ssr`; verified in Phase 5A).

## ADR-012 Public read path — Accepted
- Public pages are Server Components that call server-only data-access functions in `src/server/` directly (no HTTP hop).
- The same functions back the public JSON API (`/api/v1/...`). The API is required by CLAUDE.md Section 8 and Phase 3 and is useful for tests.
- The menu search/filter runs as one Prisma query with `where` conditions combined by AND, plus `skip/take` pagination. This differs from the synopsis pseudocode, which filters in memory (synopsis difference D-08).

## ADR-013 Freshness ≤ 30 s — Proposed (mechanism verified in Phase 4A/5B)
- Every successful admin mutation calls on-demand revalidation for the affected tags/paths (for example `menu`, `item:<slug>`, `home`, `offers`).
- Public pages also carry a time-based revalidate window of ≤ 30 s as a safety net.
- Next 16's caching APIs (`revalidateTag`/`updateTag`, `cacheLife`, Cache Components) are checked against the installed version's docs before implementation; the exact calls are recorded here then.
- Tested by TC-E2E-050: toggle availability, then poll the public page until the change shows, asserting ≤ 30 s.

## ADR-014 Rate limiting: Postgres counter table via Prisma — Accepted (CLAUDE.md Section 5 default)
- Table `RateLimitBucket(key, windowStart, count)` with an atomic upsert-increment in a fixed window. The key is an HMAC-SHA-256 of `IP + scope (+ email for login)` using the secret `RATE_LIMIT_SALT`, so raw IPs are never stored. Old buckets are pruned opportunistically.
- **Limits (initial):** login 5 per 15 min per IP+email and 20 per 15 min per IP; feedback 3 per 10 min per IP; uploads 30 per 10 min per admin.
- **Alternative:** Upstash Redis, only if the team supplies credentials. In-memory counters are never used as the production control.

## ADR-015 Image uploads: validate by magic bytes, then re-encode with `sharp` — Proposed (verified in Phase 5B)
- Accept JPEG/PNG/WebP only, at most 5 MB and at most 4000×4000 px.
- Check magic bytes first, then decode and re-encode to WebP with `sharp`. Re-encoding strips EXIF/GPS metadata and rejects disguised files that fail to decode.
- Filenames are generated as `<entity>/<uuid>.webp`. Files are stored in the Supabase Storage public bucket `public-media` through the server only, using the server-only secret key after `requireAdmin()`.
- `sharp` is already a Next.js image-optimisation dependency, so it adds little weight. This is confirmed at install time.

## ADR-016 Content Security Policy — Deferred to Phase 7 (baseline headers in Phase 2)
- **Phase 2 baseline headers:** HSTS (production only), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation off), and a CSP with `frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`, plus `img-src` and `connect-src` limited to self and the Supabase project host, and `frame-src https://www.google.com` for the map.
- **Script policy trade-off:** a nonce-based `script-src` forces every page to render dynamically, which conflicts with cached public pages (ADR-013). Phase 7 evaluates Next's SRI/hash support. Any `'unsafe-inline'` that remains is recorded as a residual risk in `SECURITY.md`.

## ADR-017 Map: keyless Google Maps embed plus a directions link — Proposed
- Use an `<iframe>` (`https://www.google.com/maps?q=<lat>,<lng>&output=embed`, lazy-loaded, with a `title`) and a "Get directions" link (`https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`).
- No API key is needed. The embed is shown only when coordinates are configured; otherwise only the address text is shown.
- **Privacy note:** loading the iframe contacts Google. This is disclosed on the contact page.

## ADR-018 QR code — Accepted
- `/qr` (public page) and `/admin/qr` show a QR code encoding `${NEXT_PUBLIC_SITE_URL}/menu?src=qr`. It is generated server-side with `qrcode` as SVG, with a PNG download.
- At startup the app refuses `localhost` or a non-https `NEXT_PUBLIC_SITE_URL` when `NODE_ENV=production`. The `src=qr` parameter is informational only; it is not stored or tracked.

## ADR-019 No ordering UI; display-only add-ons — Accepted (CLAUDE.md 3.0, 6.3)
- The Stitch customiser (radio buttons, checkboxes, quantity stepper, totals) becomes a read-only "Customisations available" list: group name, rule ("choose 1", "optional"), option names and price deltas.
- No form inputs that do nothing are rendered.

## ADR-020 Offer model: one `Offer` table with a `kind` — Proposed
- **`kind`:**
  - `DISCOUNT`: one menu item at a promotional price; the card shows a struck-through regular price.
  - `COMBO`: a bundle of items with quantities and a bundle price; "SAVE ₹X" and "% OFF" are **computed** from current item prices.
  - `INFO`: a text-only deal, such as a time-window special, with no computed price.
- **Flags:** `isStudentOffer` puts it in the Student Zone; `isFeatured` puts it on the homepage.
- **Public status** is computed in IST (`Asia/Kolkata`) from `isPublished`, `startsAt` and `endsAt`, plus a manual `expiredAt` (the admin's "Expire now"):
  - `SCHEDULED` if now < `startsAt`;
  - `EXPIRED` if `expiredAt` is set, or `endsAt` ≤ now;
  - otherwise `ACTIVE`.
- Public pages list ACTIVE offers, plus SCHEDULED ones in a separate "Coming soon" block. They never list EXPIRED ones.
- Coupon codes are not modelled. No redemption system exists (CLAUDE.md 6.2).

## ADR-021 "Popular" = best-seller OR trending flag — Accepted
Matches the synopsis `Item.IsPopular` and CLAUDE.md 3.1 E. Both flags are set by the admin; no sales statistics are computed or shown.

## ADR-022 Price-range bands — Accepted
URL params `minPrice`/`maxPrice` are whole rupees, converted to paise on the server. The UI bands are fixed and their boundaries are tested (TC-UNIT-012):
- "Under ₹100" = price < ₹100;
- "₹100–₹200" = ₹100 ≤ price ≤ ₹200;
- "₹200+" = price > ₹200.

## ADR-023 Homepage trending count: 4 — Proposed (changes assumption A-07)
The synopsis pseudocode says `FetchTrendingItems(limit=5)`, but the approved design has a 4-column grid (`lg:grid-cols-4`), so a 5th card would sit alone on a second row. The homepage therefore shows up to **4** trending/best-seller items, with a "See full menu" link. The value is a single constant and easy to change.

## ADR-024 Header layout fixes to the Stitch design — Proposed
Rendering `code.html` at 1440 px showed two defects:
- Nav labels wrap onto two lines ("Digital / Menu", "Table QR / Order").
- The desktop info bar sits inside a `fixed` header while `main` only reserves `pt-20`, so the info bar overlaps content.

**Fix:**
- The header becomes `sticky`, which removes the overlap.
- Nav labels get `whitespace-nowrap`.
- The full inline nav appears at ≥1280 px (Stitch `xl`). From 768 to 1279 px a menu button opens a drawer (Stitch provides no navigation at those widths). Below 768 px there is a compact header and a bottom navigation bar, based on the mobile Stitch screen.

## ADR-025 Demo data — Accepted
Content tables carry `isDemo Boolean @default(false)`. The seed sets `isDemo=true` and refuses to run when `NODE_ENV=production` or when `ALLOW_DEMO_SEED` is not `true`. Public pages show a small "Demo data" ribbon while any demo content is visible. Placeholder images are generated locally (neutral coloured tiles with the item name), never hotlinked.

## ADR-026 Feedback without star ratings — Proposed
Feedback is a message (10–1000 characters) plus an optional display name (≤ 40 characters). No email or phone is collected, and there are no star ratings: aggregate ratings would be shown as if verified. Only `APPROVED` feedback is public. Rate-limit keys use a hashed IP; nothing else identifying is stored. Open question Q-11 asks whether the café wants ratings.

## ADR-027 Reference rendering tool kept outside the repo — Accepted
The Phase 1 reference images in `design/reference/` were rendered with `playwright-core` 1.64.0 installed in a temporary folder (`/tmp/zorko-tools`). It drove the local Google Chrome with a throwaway profile, so no browser download or project dependency was needed. The project's own Playwright setup arrives in Phase 2.
