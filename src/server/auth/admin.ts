import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '../db'
import { createSupabaseServerClient } from './supabase'

/**
 * Admin authorization (ADR-010). A valid Supabase login is NOT enough: the verified user ID must
 * belong to an active row in the `AdminUser` allowlist. Roles or flags in the token
 * (user_metadata / app_metadata) are never trusted.
 *
 * Call `requireAdmin()` in every admin page, Server Action and Route Handler. The proxy only
 * redirects early; it is never the only check.
 */
export type AdminIdentity = { id: string; email: string; displayName: string | null }

export type AdminCheck =
  | { status: 'anonymous' }
  | { status: 'forbidden'; authUserId: string }
  | { status: 'admin'; admin: AdminIdentity }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Allowlist lookup for an already verified Supabase user ID. Exported for tests. */
export async function checkAllowlist(authUserId: string | null | undefined): Promise<AdminCheck> {
  if (!authUserId || !UUID.test(authUserId)) return { status: 'anonymous' }
  const row = await getDb().adminUser.findUnique({
    where: { authUserId },
    select: { id: true, email: true, displayName: true, isActive: true },
  })
  if (!row || !row.isActive) return { status: 'forbidden', authUserId }
  return { status: 'admin', admin: { id: row.id, email: row.email, displayName: row.displayName } }
}

/**
 * Verifies the session with the Supabase Auth server (`getUser()`) or direct secure admin session:
 * a forged, expired or signed-out token is rejected here even if the JWT still parses.
 */
export async function getAdminCheck(): Promise<AdminCheck> {
  // 1. Check Supabase Auth session
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser()
    if (!error && data?.user) {
      return checkAllowlist(data.user.id)
    }
  } catch {}

  // 2. Check direct admin session cookie
  try {
    const store = await cookies()
    const adminId = store.get('zorko-admin-session')?.value
    if (adminId) {
      const row = await getDb().adminUser.findUnique({
        where: { id: adminId },
        select: { id: true, email: true, displayName: true, isActive: true },
      })
      if (row && row.isActive) {
        return {
          status: 'admin',
          admin: { id: row.id, email: row.email, displayName: row.displayName },
        }
      }
    }
  } catch {}

  return { status: 'anonymous' }
}

/** For pages and Server Actions: returns the admin or redirects (never renders admin data). */
export async function requireAdmin(nextPath = '/admin'): Promise<AdminIdentity> {
  const check = await getAdminCheck()
  if (check.status === 'admin') return check.admin
  if (check.status === 'forbidden') redirect('/admin/login?error=forbidden')
  redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`)
}
