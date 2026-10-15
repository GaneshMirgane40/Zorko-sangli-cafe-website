import { describe, expect, it } from 'vitest'
import { parseAuthEnv } from '@/server/auth/env'
import { hashKey } from '@/server/rate-limit'

const ok = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co/',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x',
  RATE_LIMIT_SALT: 'x'.repeat(64),
}

describe('auth environment validation (TC-UNIT-040)', () => {
  it('accepts a complete configuration and keeps only the origin', () => {
    expect(parseAuthEnv(ok).supabaseUrl).toBe('https://abc.supabase.co')
    expect(
      parseAuthEnv({ ...ok, NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co/rest/v1/' })
        .supabaseUrl,
    ).toBe('https://abc.supabase.co')
  })
  it('names missing or weak variables without echoing values', () => {
    const run = () =>
      parseAuthEnv({ ...ok, NEXT_PUBLIC_SUPABASE_URL: 'http://plain', RATE_LIMIT_SALT: 'short' })
    expect(run).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
    expect(run).toThrow(/RATE_LIMIT_SALT/)
    expect(run).not.toThrow(/short|plain/)
  })
})

describe('rate-limit keys (ADR-014)', () => {
  it('are salted HMACs: stable, never the raw IP, different per salt', () => {
    const a = hashKey(['login', '203.0.113.9'], 'salt-one'.repeat(5))
    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(a).toBe(hashKey(['login', '203.0.113.9'], 'salt-one'.repeat(5)))
    expect(a).not.toContain('203')
    expect(a).not.toBe(hashKey(['login', '203.0.113.9'], 'salt-two'.repeat(5)))
  })
})
