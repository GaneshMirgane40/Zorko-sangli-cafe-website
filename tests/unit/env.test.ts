import { describe, expect, it } from 'vitest'
import { EnvValidationError, parsePublicEnv } from '@/lib/config/env'

describe('parsePublicEnv (TC-UNIT-002/003)', () => {
  it('defaults to localhost outside production when unset', () => {
    expect(parsePublicEnv({}).siteUrl).toBe('http://localhost:3000')
  })

  it('strips trailing slashes', () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_SITE_URL: 'https://zorko.example/' }).siteUrl).toBe(
      'https://zorko.example',
    )
  })

  it('allows http://localhost for local production builds (no VERCEL_ENV)', () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' }).siteUrl).toBe(
      'http://localhost:3000',
    )
  })

  it('rejects a non-URL value', () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SITE_URL: 'zorko' })).toThrow(EnvValidationError)
  })

  it('rejects non-http schemes', () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SITE_URL: 'javascript:alert(1)' })).toThrow(
      EnvValidationError,
    )
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SITE_URL: 'ftp://zorko.example' })).toThrow(
      EnvValidationError,
    )
  })

  describe('on Vercel production', () => {
    const prod = { VERCEL_ENV: 'production' }

    it('requires the variable', () => {
      expect(() => parsePublicEnv(prod)).toThrow(/NEXT_PUBLIC_SITE_URL is required/)
    })
    it('requires https', () => {
      expect(() =>
        parsePublicEnv({ ...prod, NEXT_PUBLIC_SITE_URL: 'http://zorko.example' }),
      ).toThrow(/https/)
    })
    it('rejects localhost even over https', () => {
      expect(() => parsePublicEnv({ ...prod, NEXT_PUBLIC_SITE_URL: 'https://localhost' })).toThrow(
        /localhost/,
      )
    })
    it('accepts an https domain', () => {
      expect(
        parsePublicEnv({ ...prod, NEXT_PUBLIC_SITE_URL: 'https://zorko.example' }).siteUrl,
      ).toBe('https://zorko.example')
    })
  })

  it('names the variable but never echoes its value', () => {
    const secretLooking = 'not a url sb_secret_abc123'
    try {
      parsePublicEnv({ NEXT_PUBLIC_SITE_URL: secretLooking })
      expect.unreachable()
    } catch (error) {
      expect((error as Error).message).toContain('NEXT_PUBLIC_SITE_URL')
      expect((error as Error).message).not.toContain('sb_secret_abc123')
    }
  })
})
