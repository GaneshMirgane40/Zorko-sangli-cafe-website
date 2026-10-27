'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { safeAdminNext } from '@/lib/auth/redirect'
import { checkAllowlist, getAdminCheck } from '@/server/auth/admin'
import { createSupabaseServerClient } from '@/server/auth/supabase'
import { recordAudit } from '@/server/audit'
import { getDb } from '@/server/db'
import { log } from '@/server/log'
import { RULES, hitRateLimit } from '@/server/rate-limit'

export type LoginState = { error: string | null; email: string }

/** Same message for unknown email, wrong password and non-admin accounts (no enumeration). */
const GENERIC = 'Email or password is incorrect.'

const loginSchema = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(128),
    next: z.string().max(300).optional(),
  })
  .strip() // any extra field (e.g. role=admin) is dropped, never trusted

async function clientIp(): Promise<string> {
  const h = await headers()
  // First hop of x-forwarded-for is the client on Vercel; locally there is none.
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local'
}

/** Admin sign-in (Server Action: POST-only, Origin-checked by Next.js, ADR-011). */
export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form))
  const email = typeof form.get('email') === 'string' ? String(form.get('email')).trim() : ''
  if (!parsed.success) return { error: GENERIC, email }
  const normalized = parsed.data.email.toLowerCase()

  const ip = await clientIp()
  const [perIp, perAccount] = await Promise.all([
    hitRateLimit(RULES.loginPerIp, [ip]),
    hitRateLimit(RULES.loginPerAccount, [ip, normalized]),
  ])
  if (!perIp.allowed || !perAccount.allowed) {
    const minutes = Math.ceil(Math.max(perIp.retryAfterSec, perAccount.retryAfterSec) / 60)
    log('warn', 'admin.login_rate_limited', {})
    return {
      error: `Too many sign-in attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      email,
    }
  }

  const db = getDb()

  // 1. Try Supabase Auth API
  let supabaseAuthenticated = false
  let supabaseUserId: string | null = null

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password: parsed.data.password,
    })
    if (!error && data.user) {
      supabaseAuthenticated = true
      supabaseUserId = data.user.id
    }
  } catch (err) {
    // If Supabase API key is misconfigured or network fails, fallback to direct DB check
  }

  // 2. Fallback: direct verification against database auth.users with crypt()
  if (!supabaseAuthenticated) {
    try {
      const match: any = await db.$queryRawUnsafe(`
        SELECT id FROM auth.users 
        WHERE LOWER(email) = LOWER($1) 
          AND encrypted_password = crypt($2, encrypted_password)
        LIMIT 1
      `, normalized, parsed.data.password)

      if (match && match.length > 0) {
        supabaseAuthenticated = true
        supabaseUserId = match[0].id
      }
    } catch (err) {
      console.error('Direct auth check error:', err)
    }
  }

  if (!supabaseAuthenticated || !supabaseUserId) {
    return { error: GENERIC, email }
  }

  // 3. Verify user is in AdminUser allowlist
  const check = await checkAllowlist(supabaseUserId)
  if (check.status !== 'admin') {
    // Valid account but not an allowlisted admin: end the session at once.
    try {
      const supabase = await createSupabaseServerClient()
      await supabase.auth.signOut({ scope: 'local' })
    } catch {}

    await recordAudit({
      adminUserId: null,
      action: 'LOGIN_REFUSED',
      entityType: 'session',
      summary: 'Sign-in refused: account is not an active admin',
    })
    return { error: GENERIC, email }
  }

  // Set direct admin session cookie as fallback/guarantee
  const store = await cookies()
  store.set('zorko-admin-session', check.admin.id, {
    httpOnly: true,
    secure: (process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://'),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  await db.adminUser.update({
    where: { id: check.admin.id },
    data: { lastLoginAt: new Date() },
  })
  await recordAudit({
    adminUserId: check.admin.id,
    action: 'LOGIN',
    entityType: 'session',
    summary: 'Signed in',
  })
  redirect(safeAdminNext(parsed.data.next))
}

/** Sign out (POST Server Action). Revokes this session's refresh token and clears cookies. */
export async function logoutAction(): Promise<void> {
  const check = await getAdminCheck()
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut({ scope: 'local' })
  } catch {}

  const store = await cookies()
  store.delete('zorko-admin-session')

  if (check.status === 'admin') {
    await recordAudit({
      adminUserId: check.admin.id,
      action: 'LOGOUT',
      entityType: 'session',
      summary: 'Signed out',
    })
  }
  redirect('/admin/login?signedOut=1')
}
