import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { createServerClient } from '@supabase/ssr'
import { describe, expect, it } from 'vitest'

/**
 * TC-SEC-003/004: forged, unsigned and expired session cookies must be rejected by the same calls
 * the app uses (`getUser()` in requireAdmin, `getClaims()` in the proxy). Runs against the team's
 * DEVELOPMENT Supabase project; read-only (no user is created). Values are never printed.
 */
if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const url = rawUrl ? new URL(rawUrl.trim()).origin : undefined
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const b64url = (v: object | string) =>
  Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url')

function jwt(
  payload: Record<string, unknown>,
  alg = 'RS256',
  signature = b64url('forged-signature'),
) {
  return `${b64url({ alg, typ: 'JWT', kid: randomUUID() })}.${b64url(payload)}.${signature}`
}

/** A Supabase client whose only cookie is a session we made up (as an attacker would). */
function clientWithSession(accessToken: string) {
  const ref = new URL(url!).hostname.split('.')[0]
  const session = {
    access_token: accessToken,
    refresh_token: 'forged-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: randomUUID(),
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: { role: 'admin' },
    },
  }
  const cookies = [{ name: `sb-${ref}-auth-token`, value: `base64-${b64url(session)}` }]
  return createServerClient(url!, key!, { cookies: { getAll: () => cookies, setAll: () => {} } })
}

const now = Math.floor(Date.now() / 1000)
const claims = (exp: number) => ({
  sub: randomUUID(),
  aud: 'authenticated',
  role: 'authenticated',
  exp,
  iat: now - 60,
  app_metadata: { role: 'admin' }, // role escalation attempt: must not matter
})

describe.runIf(Boolean(url && key))(
  'session verification against Supabase Auth (TC-SEC-003/004)',
  () => {
    const cases: [string, string][] = [
      ['forged signature', jwt(claims(now + 3600))],
      ['unsigned (alg: none)', jwt(claims(now + 3600), 'none', '')],
      ['symmetric alg with a guessed secret', jwt(claims(now + 3600), 'HS256')],
      ['expired', jwt(claims(now - 3600))],
      ['garbage', 'not-a-jwt'],
    ]
    for (const [name, token] of cases) {
      it(`rejects a ${name} session cookie in getUser() (requireAdmin)`, async () => {
        const { data, error } = await clientWithSession(token).auth.getUser()
        expect(data.user).toBeNull()
        expect(error).toBeTruthy()
      })
      it(`rejects a ${name} session cookie in getClaims() (proxy)`, async () => {
        const { data } = await clientWithSession(token).auth.getClaims()
        expect(data?.claims?.sub ?? null).toBeNull()
      })
    }
  },
)

describe.skipIf(Boolean(url && key))('session verification against Supabase Auth', () => {
  it.skip('NOT RUN: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY not set', () => {})
})

// TC-SEC-006: public signup must be disabled. Runs only once the Phase 5A prerequisites are done
// (the E2E accounts exist), because with signup still enabled this would create a user.
const prerequisitesDone = Boolean(process.env.E2E_ADMIN_EMAIL && process.env.E2E_USER_EMAIL)
describe.runIf(Boolean(url && key) && prerequisitesDone)(
  'public signup is disabled (TC-SEC-006)',
  () => {
    it('a signup attempt with the publishable key is refused', async () => {
      const supabase = createServerClient(url!, key!, {
        cookies: { getAll: () => [], setAll: () => {} },
      })
      // A plus-variant of the team's own test address: example.com is rejected earlier as an
      // invalid address, which would make the test pass without reaching the signup check.
      const [local, domain] = process.env.E2E_USER_EMAIL!.split('@')
      const { data, error } = await supabase.auth.signUp({
        email: `${local}+signup-probe-${randomUUID().slice(0, 8)}@${domain}`,
        password: `Probe-${randomUUID()}`,
      })
      expect(data.user).toBeNull()
      // Supabase checks "signup disabled" before validating the address or sending email.
      expect(error?.code).toBe('signup_disabled')
    })
  },
)
describe.skipIf(Boolean(url && key) && prerequisitesDone)('public signup is disabled', () => {
  it.skip('NOT RUN: Phase 5A prerequisites (E2E_* accounts in .env.local) not done yet', () => {})
})
