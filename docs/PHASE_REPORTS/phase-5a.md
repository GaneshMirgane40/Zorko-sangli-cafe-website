# Phase 5A — Authentication and admin shell

**Status:** AWAITING TEAM VERIFICATION (signed-in tests NOT RUN, see §5) · **Branch:** `phase-5a` · **Date:** 2026-10-15
**Approval of Phase 4B recorded:** 2026-10-15, "approved, go to Phase 5A" (merged to `main`, tag `phase-4b-approved`).

The team chose to do the Supabase setup (prerequisites) while verifying this phase, not before it. Everything that can be verified without those accounts was run; the signed-in tests are written and will run once the accounts exist (§HOW TO TEST step 1).

## 1. Requirements addressed

| Area | Delivered |
|---|---|
| Admin login and logout (FR-030) | `/admin/login`: email + password Server Action, one generic error ("Email or password is incorrect."), no signup or "forgot password" link. Logout is a POST Server Action that ends the session and writes an audit entry. Notices for "session expired", "signed out" and "not allowed". |
| Allowlist authorization (FR-031) | `requireAdmin()` checks the session with the Supabase Auth server (`getUser()`), then requires an active `AdminUser` row. A valid Supabase login alone is refused, and the non-admin is signed out at once. Token roles (`app_metadata`) are never read. Every admin page calls it, and so does the shell layout. |
| Proxy (Next 16 `proxy.ts`) | Refreshes the session cookie for `/admin/*`, sends visitors without a session to `/admin/login?next=…` (and adds `expired=1` when a session cookie was present but invalid), and sets `Cache-Control: private, no-store` and `X-Robots-Tag: noindex`. It is a convenience, not the security boundary. |
| Login protection (FR-032) | Postgres rate limiter: 5 attempts per IP+email and 20 per IP in 15 min. Counted atomically; keys are HMACs, so no raw IPs or emails are stored. `?next=` accepts internal `/admin` paths only. Extra form fields are stripped. |
| Admin shell and dashboard (FR-033) | Sidebar at ≥1024 px and a menu drawer below that, listing only modules that exist (Dashboard for now); the signed-in name and **Log out**. Dashboard: 7 real counts (items, available, out of stock, active offers, scheduled offers, pending feedback, gallery photos) and the 10 latest audit entries. No revenue, orders or charts. |
| Audit log (CLAUDE.md §4.9) | `recordAudit()`: `LOGIN`, `LOGIN_REFUSED`, `LOGOUT` and `ADMIN_ALLOWLISTED`, with a short summary that never contains emails, IPs, tokens or passwords. |
| Provisioning | `npm run admin:add -- --user-id <UID> --email <email>`, `admin:disable`, `admin:list`. No Supabase secret key is needed; production changes need an explicit `--production` flag. |
| Signup disabled | Done by the team in the Supabase dashboard (prerequisite); checked by TC-SEC-006 once the accounts exist. |

## 2. Files

- **New:**
  - Server: `src/proxy.ts`, `src/server/auth/{env,supabase,admin}.ts`, `src/server/{rate-limit,audit}.ts`, `src/server/services/dashboard.ts`
  - Admin UI: `src/app/(admin)/admin/login/page.tsx`, `src/app/(admin)/admin/(shell)/{layout,page}.tsx`, `src/features/admin/{actions.ts,login-form.tsx}`, `src/components/layout/admin-nav.tsx`
  - Helpers: `src/lib/auth/redirect.ts`, `src/lib/site/admin-nav.ts`
  - Script: `prisma/admin-allowlist.ts`
- **Tests:** `tests/unit/{admin-auth,auth-env}.test.ts`, `tests/integration/admin.test.ts`, `tests/supabase/auth-tokens.test.ts`, `tests/e2e/admin.spec.ts`, admin login baselines
- **Modified:** `src/app/robots.ts` (`/admin` disallowed), `tests/supabase/rest-denied.test.ts` (false-pass fix), `playwright.config.ts` and `vitest.integration.config.mts` (fixed test-only rate-limit salt), `package.json` (`@supabase/ssr` 0.12.7, `@supabase/supabase-js` 2.118.0, `admin:*` scripts)
- **Docs:** DECISIONS (ADR-048), DEPLOYMENT §3/§6, TRD, TEST_PLAN, TRACEABILITY, errata in `phase-3.md` and `phase-4b.md`

## 3. Decisions (ADR-048)

- **Checks:** the proxy uses `getClaims()` (fast, local JWT check); `requireAdmin()` uses `getUser()` (asks the Auth server), so a signed-out or forged token is refused at once, not only when it expires.
- **No browser client:** login and logout run on the server, so no Supabase key ships to the browser.
- **Client IP:** taken from the first `x-forwarded-for` hop, which is trustworthy on Vercel. It could be spoofed on a self-hosted `next start`, which is used only locally. Supabase's own sign-in limits are a second layer.
- **Supabase URL:** only its origin is used, so the REST URL (`…/rest/v1/`) also works.

## 4. Commands actually executed

```
npm install @supabase/ssr@0.12.7 @supabase/supabase-js@2.118.0
npx next build ; next start (test DB) + curl: /admin and /admin/menu → 307 to login; login page no-store + noindex
client-bundle scan for the publishable key, rate-limit salt and DATABASE_URL → 0 matches
npm run check ; npm run test:integration ; npm run test:supabase
npm run test:db:reset ; npx playwright test --project=chromium --workers=2 ; … --project=webkit --workers=2
```

## 5. Test results

| Suite | Result |
|---|---|
| `npm run check` (lint, typecheck, format, unit + component, build) | **PASS**, 150 tests (22 new) |
| Integration (local Postgres) | **PASS**, 80/80 (10 new: authorization matrix, role escalation, rate limits incl. concurrency, HMAC-only storage, audit, dashboard counts) |
| Supabase (dev project) | **PASS**, 45: REST denial now genuinely verified on all 17 tables + positive control (§6); forged, unsigned, guessed-secret, expired and garbage sessions rejected by `getUser()` and `getClaims()`. 4 "NOT RUN" placeholders skipped by design. |
| E2E Chromium | **PASS**, 122. Admin: redirects, login page (no signup, noindex, no-store, axe), generic error, open-redirect, forged cookie → "session expired", 6th attempt rate-limited. |
| E2E WebKit | **PASS**, 105 (rate-limit and visual tests are Chromium-only) |
| Visual baselines | **PASS**: admin login desktop + mobile recorded and reviewed |
| **Signed-in E2E** (admin login → dashboard counts, HttpOnly/SameSite cookies, non-admin refused and signed out, logout, mobile drawer), **TC-SEC-006** (signup disabled), dashboard baseline | **NOT RUN**: they need the team's test accounts (prerequisites). They skip with the message "NOT RUN: set E2E_ADMIN_* and E2E_USER_*…", never pass silently. |

## 6. Security checks and findings

- **Finding (fixed): false pass in TC-SEC-020 since Phase 3.**
  - The dev `NEXT_PUBLIC_SUPABASE_URL` is the REST URL (`…/rest/v1/`), and the test appended `/rest/v1/<table>` again.
  - Every request therefore hit an invalid path (404 `PGRST125`), which the test counted as "denied".
  - The test is fixed and the result is now verified: **every table is denied (401, `42501`)** for reads and writes. Errata were added to the Phase 3 and 4B reports.
- **Verified in this phase:**
  - No Supabase key, salt or database URL in the client bundles.
  - Admin responses are `no-store` and `noindex`; `/admin` is in robots Disallow.
  - Forged, unsigned and expired sessions are refused (Supabase tests).
  - The allowlist decision ignores token roles (integration test).
  - Rate-limit keys are HMACs only (integration test).
  - `?next=` open-redirect payloads are rejected (14 unit cases, plus E2E).
- **CSRF:** login and logout are Server Actions, so Next.js checks Origin against Host and they are POST-only (ADR-011). There are no state-changing admin route handlers yet.
- **Not yet verified:** cookie flags on a real login, and logout followed by reuse of the old cookie (TC-SEC-007/009). They are in the signed-in E2E tests (NOT RUN, see §5).

## 7. UI consistency

- **Login:** the centred card from UI_SPEC §13 (logo tile, "Admin sign in", email, password, full-width primary button), checked at 1440 and 390 px.
- **Admin shell:** follows UI_SPEC §8.4 (sidebar `w-64` at ≥1024 px, drawer below, active item `bg-primary-container`), with the public site's tokens.
- **Dashboard:** visually checked only after the test accounts exist (NOT RUN).

## 8. Defects found during self-verification (fixed)

1. **Supabase URL with a path** broke sign-in (`EnvValidationError`) and caused the TC-SEC-020 false pass. The app now uses the origin, and the test is fixed.
2. **The login page placeholder was a second form** (duplicate fields for a moment, confusing for screen readers). It is now a skeleton.
3. **The REST insert probe used an `id` column** that `OfferMenuItem` doesn't have (400 before the permission check). It now uses `{}`.
4. **Playwright couldn't load Prisma's generated client.** The E2E setup uses one parameterized `pg` query instead.

## 9. Known limitations (not bugs)

- **Signed-in tests are NOT RUN** until the team creates the accounts (step 1 below).
- **The sidebar shows only "Dashboard":** menu, offers, café, gallery, feedback and QR modules come in Phases 5B, 5C and 6, and their links appear then.
- **No MFA yet** (optional, Q-14).
- **No in-app password reset:** passwords are reset in the Supabase dashboard (DEPLOYMENT §6).
- **A signed-out session's access token** is still accepted by the *proxy* until it expires (≤1 h), but every admin page refuses it (`getUser()`), so no admin data is shown.

## 10. Gate evidence

Every protected route redirects anonymous visitors, and the server-side authorization check is verified for:
- anonymous visitors
- authenticated non-allowlisted users
- inactive admins
- forged, unsigned and expired sessions
- role-escalation attempts

Final confirmation of the signed-in journey needs the team's accounts (HOW TO TEST step 1).

---

## HOW TO TEST THIS PHASE

### Step 1: one-time Supabase setup (about 10 minutes, dev project only)

1. Open https://supabase.com/dashboard and choose your **development** project.
2. **Turn off public signup:** left menu **Authentication** → **Sign In / Providers** (on some dashboards: *Providers* or *Settings*). Find **"Allow new users to sign up"**, switch it **off** and **Save**. Leave the **Email** provider **enabled**.
3. **Create 3 users:** **Authentication** → **Users** → **Add user** → **Create new user**. For each one, enter the email and a password, tick **Auto Confirm User** and click **Create user**:

   | User | Email (example) | Purpose |
   |---|---|---|
   | Your real admin | your own email | You log in to the dashboard with it |
   | Test admin | `youremail+e2e-admin@gmail.com` | Used only by the automated tests |
   | Test non-admin | `youremail+e2e-user@gmail.com` | Proves that a normal account is refused |

   Gmail delivers `+anything` addresses to your normal inbox, so you don't need new mailboxes. Use different strong passwords.
4. Click **your real admin** user in the list and **copy its "User UID"** (it looks like `1b2c3d4e-…`).
5. Open `.env.local` in the project folder (in VS Code) and add these lines at the end. Fill in your values, and don't share them in chat:
   ```
   RATE_LIMIT_SALT=paste-the-output-of-the-command-below
   E2E_ADMIN_EMAIL=youremail+e2e-admin@gmail.com
   E2E_ADMIN_PASSWORD=the-test-admin-password
   E2E_USER_EMAIL=youremail+e2e-user@gmail.com
   E2E_USER_PASSWORD=the-test-user-password
   ```
   To generate the salt, run `openssl rand -hex 32` in a terminal and paste the 64-character result.
6. Optional, recommended: in `.env.local`, change `NEXT_PUBLIC_SUPABASE_URL` to just `https://<your-project-ref>.supabase.co`, without `/rest/v1/` at the end.
7. **Add your real admin to the allowlist** (in the project folder):
   ```bash
   git switch phase-5a && npm ci
   npm run admin:add -- --user-id <the User UID you copied> --email <your real admin email> --name "Your name"
   npm run admin:list        # should show: active  <your email>  last login: never
   ```

### Step 2: try it yourself
```bash
npm run dev      # http://localhost:3000
```
1. Open `http://localhost:3000/admin`. You are sent to **Admin sign in** (the address ends in `?next=%2Fadmin`).
2. Sign in with a **wrong password**: you get "Email or password is incorrect." Do it 6 times with the same email, and the 6th says "Too many sign-in attempts…".
3. Sign in with your **real admin** account: the **Dashboard** shows 7 counts (Menu items 65 with the real menu) and "Recent activity" with "Signed in".
4. Sign in with the **test non-admin** account: you get the same generic error and no dashboard.
5. Click **Log out**: you see "You have been signed out." Opening `/admin` sends you to the login page again.
6. On a narrow window (about 390 px): the menu button opens a drawer with Dashboard and Log out. Nothing scrolls sideways.
7. Optional: in Supabase **Authentication → Users** the users exist, and there's no way to sign up on the site.

### Step 3: automated tests (Docker Desktop running)
```bash
npm run check                      # PASS, 150 tests
npm run test:integration           # 80 passed
npm run test:supabase              # 46 passed (the signup-disabled test runs now too)
npm run test:db:reset && npx playwright test --workers=2
```
After step 1, the signed-in admin tests and TC-SEC-006 run instead of being skipped. If one fails, send me its name and error text.

**Not bugs:**
- The sidebar has only "Dashboard" (more modules in 5B/5C/6).
- There's no "forgot password" link (reset in the Supabase dashboard).
- "Gallery photos 0" and "Pending feedback 0" are real counts.

**If something fails, send:**
- the step number
- what you saw (a screenshot)
- the terminal error lines, **with any passwords or keys removed**

Phase 5A complete. Waiting for your approval or bug reports before starting Phase 5B. To approve, reply exactly: approved, go to Phase 5B
