import { describe, expect, it } from 'vitest'
import { buildContentSecurityPolicy, buildSecurityHeaders } from '@/lib/security/headers'

describe('security headers (TC-SEC-110, unit level)', () => {
  it('production CSP blocks framing, plugins and foreign base URIs, without unsafe-eval', () => {
    const csp = buildContentSecurityPolicy({ isDev: false, isHttps: true })
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).not.toContain('unsafe-eval')
    expect(csp).toContain('upgrade-insecure-requests')
  })

  it('allows the Supabase origin for images and API calls only when configured', () => {
    expect(buildContentSecurityPolicy({ isDev: false, isHttps: true })).not.toContain('supabase')
    const csp = buildContentSecurityPolicy({
      isDev: false,
      isHttps: true,
      supabaseOrigin: 'https://abc.supabase.co',
    })
    expect(csp).toMatch(/img-src [^;]*https:\/\/abc\.supabase\.co/)
    expect(csp).toMatch(/connect-src [^;]*https:\/\/abc\.supabase\.co/)
    expect(csp).not.toMatch(/script-src [^;]*supabase/)
  })

  it('sends HSTS only for https sites', () => {
    const keys = (isHttps: boolean) =>
      buildSecurityHeaders({ isDev: false, isHttps }).map((h) => h.key)
    expect(keys(true)).toContain('Strict-Transport-Security')
    expect(keys(false)).not.toContain('Strict-Transport-Security')
  })

  it('never upgrades requests on a plain-http site (Safari applies it to localhost too)', () => {
    expect(buildContentSecurityPolicy({ isDev: false, isHttps: false })).not.toContain(
      'upgrade-insecure-requests',
    )
    expect(buildContentSecurityPolicy({ isDev: false, isHttps: true })).toContain(
      'upgrade-insecure-requests',
    )
  })

  it('includes the baseline hardening headers', () => {
    const map = Object.fromEntries(
      buildSecurityHeaders({ isDev: false, isHttps: true }).map((h) => [h.key, h.value]),
    )
    expect(map['X-Content-Type-Options']).toBe('nosniff')
    expect(map['X-Frame-Options']).toBe('DENY')
    expect(map['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(map['Permissions-Policy']).toContain('camera=()')
  })
})
