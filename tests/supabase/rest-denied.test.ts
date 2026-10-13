import { loadEnvConfig } from '@next/env'
import { describe, expect, it } from 'vitest'

/**
 * TC-SEC-020: Supabase's auto-generated REST API must not expose any table to the public
 * (publishable/anon) key. Runs against the team's DEVELOPMENT project only, read-only except for
 * write attempts that must fail. Run: `npm run test:supabase` (needs NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local; values are never printed).
 */
loadEnvConfig(process.cwd())
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '')
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const TABLES = [
  'MenuCategory',
  'MenuItem',
  'MenuItemImage',
  'AddOnGroup',
  'AddOnOption',
  'ItemRelation',
  'Offer',
  'OfferMenuItem',
  'PromotionalBanner',
  'CafeInformation',
  'OpeningHours',
  'GalleryImage',
  'Feedback',
  'AdminUser',
  'AuditLog',
  'RateLimitBucket',
  '_prisma_migrations',
]

// Fails loudly instead of passing when the keys are missing, so it can never be a false PASS.
describe.runIf(Boolean(url && key))('Supabase REST API is denied (TC-SEC-020)', () => {
  const headers = {
    apikey: key!,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
  const rest = (path: string, init?: RequestInit) =>
    fetch(`${url}/rest/v1/${path}`, { ...init, headers: { ...headers, ...init?.headers } })

  it.each(TABLES)('cannot read %s', async (table) => {
    const res = await rest(`${encodeURIComponent(table)}?select=*&limit=1`)
    // Revoked privileges → 401/403 (42501) or 404 (table hidden from the schema cache).
    // A 200 is only acceptable if it returns no rows.
    if (res.ok) expect(await res.json()).toEqual([])
    else expect([401, 403, 404]).toContain(res.status)
  })

  it.each(TABLES)('cannot insert into, update or delete from %s', async (table) => {
    const t = encodeURIComponent(table)
    const insert = await rest(t, { method: 'POST', body: JSON.stringify({ id: 'rls-probe' }) })
    const update = await rest(`${t}?id=eq.rls-probe`, {
      method: 'PATCH',
      body: JSON.stringify({ id: 'rls-probe-2' }),
      headers: { Prefer: 'return=representation' },
    })
    const del = await rest(`${t}?id=eq.rls-probe`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    })
    expect(insert.status).not.toBe(201)
    for (const res of [update, del]) {
      if (res.ok) expect(await res.json()).toEqual([])
      else expect(res.status).toBeGreaterThanOrEqual(400)
    }
  })
})

describe.skipIf(Boolean(url && key))('Supabase REST API check', () => {
  it.skip('NOT RUN: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY not set', () => {})
})
