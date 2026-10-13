# DEPLOYMENT

**Version:** 1.0 (Phase 1 skeleton). Commands marked *(Phase N)* become available in that phase; this document is completed and verified step by step through Phase 8.

## 1. Environments

| Env | App | Database / Auth / Storage | Who may change it |
|---|---|---|---|
| Local | `npm run dev` on the team's laptop | Supabase **dev** project (`zorko-sangli-dev`) | Team |
| Preview | Vercel preview deployments | Supabase **dev** project | Team (after Phase 8 setup) |
| Production | Vercel production (`main`) | Supabase **prod** project (`zorko-sangli-prod`) | Only with written team approval (CLAUDE.md rule 14) |

Never point local or preview at the production database.

## 2. Prerequisites

- Node.js 22.x LTS (≥22.13; the dev machine has 22.13.1), npm 11, Git.
- Supabase account with two projects (Mumbai region recommended).
- Vercel account (Phase 8).
- Docker Desktop is optional; it may be used for a local Postgres in CI-like integration tests.

## 3. Environment variables

The full table is in TRD §8.
- Copy `.env.example` → `.env.local` (git-ignored) and fill in the values from the Supabase dashboard.
- **Never paste values into chat, issues or commits.**
- Server-only variables must not start with `NEXT_PUBLIC_`.
- Where to find each value in the Supabase dashboard *(verified against the dashboard in Phase 3)*:
  - **`DATABASE_URL`:** Project → Connect → *Transaction pooler* (port 6543). Append the query parameters required by the Prisma 7 docs (recorded in Phase 3).
  - **`DIRECT_URL`:** Project → Connect → *Direct connection* or *Session pooler* (port 5432).
  - **`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`:** Project Settings → API Keys (publishable key, or the legacy anon key).
  - **`SUPABASE_SECRET_KEY`:** Project Settings → API Keys → secret key (or the legacy service_role). Server only.
  - **`RATE_LIMIT_SALT`:** generate with `openssl rand -hex 32`.
  - **`NEXT_PUBLIC_SITE_URL`:** `http://localhost:3000` locally; the https production domain in production.

## 4. Local setup *(Phase 2+)*

```bash
git clone <repo> && cd zorko-sangli
npm ci
cp .env.example .env.local   # then fill values (Phase 3+ needs Supabase values)
npm run dev                  # http://localhost:3000
curl http://localhost:3000/api/health
```

## 5. Database setup *(Phase 3)*

```bash
npx prisma migrate dev           # DEV project only: applies migrations incl. RLS/REVOKE SQL
ALLOW_DEMO_SEED=true npm run db:seed   # demo data, refuses in production
```
- Production: `npx prisma migrate deploy`, **only with written approval**, after a backup (§9).
- `prisma migrate reset` (destructive) only on the dev project and only with team approval.
- **Replacing demo data with real data:** edit through the admin panel (preferred), or run `npm run db:clear-demo` *(Phase 3, deletes only `isDemo=true` rows after an interactive confirmation)*.

## 6. First-admin provisioning *(Phase 5A)*

1. Supabase dashboard → Authentication → Sign In / Providers → **disable "Allow new users to sign up"**. Keep Email provider enabled.
2. Authentication → Users → **Add user** → email + strong password (≥14 chars, password manager), "Auto confirm user".
3. On the dev machine: `npm run admin:grant -- --email <admin email>`. This looks up the user ID with the server-only secret key and inserts or activates the `AdminUser` row. It never creates or prints passwords.
4. Log in at `/admin/login`.
5. Optional (Q-14): enable MFA (TOTP) for admins in Supabase.

- **Revoke an admin:** `npm run admin:revoke -- --email <email>` (sets `isActive=false`). Optionally delete the user in Supabase.
- **Recovery:**
  - Forgotten password: reset it in the Supabase dashboard (Users → user → Reset password / Send recovery email).
  - Lost all admins: repeat steps 2–3.

## 7. Storage *(Phase 5B)*

- Create bucket `public-media`, **Public: on**, file size limit 5 MB, allowed MIME `image/webp,image/jpeg,image/png`.
- Do **not** add insert/update/delete policies for `anon`/`authenticated`.
- `next.config` `images.remotePatterns` must contain the project host.

## 8. Build, test, deploy *(Phase 2+ / Phase 8)*

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e
```
- **Vercel (Phase 8, with approval):**
  - Import the repo and set the env vars for Production and Preview separately.
  - Set the region to `bom1`.
  - The production branch is `main`.
- After deploy:
  - `GET /api/health` returns `{"status":"ok","db":"ok"}`.
  - Open `/qr` and confirm the encoded URL is the https production domain.

## 9. Backups

- Supabase automatic daily backups (plan-dependent; check Project → Database → Backups).
- Before every production migration: `pg_dump "$DIRECT_URL" -Fc -f backup-YYYYMMDD.dump`. Run it locally, store the file privately, and never commit it.

## 10. Rollback

- **App:** Vercel → Deployments → previous deployment → *Promote to Production*.
- **Database:** forward-fix migration. If necessary, restore from backup (`pg_restore`) **only with written approval**.
- **Content mistakes:** use the audit log to identify the change and revert it via the admin.

## 11. Credential rotation

| Secret | How |
|---|---|
| DB password | Supabase → Database → Reset password → update `DATABASE_URL`/`DIRECT_URL` locally and in Vercel → redeploy |
| Secret key | Supabase → API Keys → create new secret key → update `SUPABASE_SECRET_KEY` → redeploy → delete old key |
| Publishable key | Same process (public, but rotate if abused) |
| `RATE_LIMIT_SALT` | Generate new → update env → redeploy (resets current windows) |
| Admin password | Supabase dashboard reset |

If any secret appears in a log, chat, commit or screenshot, treat it as compromised, rotate it immediately, and record it in the phase report.

## 12. Demo / viva checklist

- [ ] Wake the Supabase projects (free tier pauses after inactivity): open the dashboard and call `/api/health`.
- [ ] Confirm demo-data ribbon state (expected or not).
- [ ] Print or test the QR code from `/admin/qr` on a phone.
- [ ] Admin credentials are available in the team's password manager.

## 13. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Env validation failed: DATABASE_URL` | `.env.local` missing or wrong file name |
| Prisma "prepared statement already exists" | Pooled URL missing the pgbouncer parameter (Phase 3 notes) |
| Images not loading | `remotePatterns` host mismatch or bucket not public |
| QR points to localhost | `NEXT_PUBLIC_SITE_URL` not set for that environment |
| Admin login loops | Cookie not set (site URL/domain mismatch), or the user is not in `AdminUser` |
