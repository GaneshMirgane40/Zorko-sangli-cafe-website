import { z } from 'zod'

/**
 * Public (browser-safe) environment configuration.
 *
 * Only `NEXT_PUBLIC_*` values belong here; they are inlined into client bundles at build time.
 * Server-only secrets get their own `server-only` module from Phase 3 onwards.
 *
 * Production strictness is keyed to `VERCEL_ENV === 'production'` (a real deployment), not to
 * `NODE_ENV`, because `next build && next start` on a laptop or in CI also sets
 * NODE_ENV=production while legitimately using http://localhost.
 */

const siteUrlSchema = z
  .url({ message: 'must be an absolute URL, e.g. https://example.com' })
  .transform((value) => value.replace(/\/+$/, '')) // drop trailing slashes so we can append paths

export type PublicEnv = {
  siteUrl: string
}

type EnvSource = Record<string, string | undefined>

export class EnvValidationError extends Error {
  constructor(problems: string[]) {
    // Name the variables only — never echo their values (CLAUDE.md rule 23).
    super(`Environment validation failed:\n- ${problems.join('\n- ')}`)
    this.name = 'EnvValidationError'
  }
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]'])

/** Pure parser so it can be unit-tested with any input. */
export function parsePublicEnv(source: EnvSource): PublicEnv {
  const isVercelProduction = source.VERCEL_ENV === 'production'
  const problems: string[] = []

  const rawSiteUrl = source.NEXT_PUBLIC_SITE_URL?.trim()
  let siteUrl = 'http://localhost:3000'

  if (!rawSiteUrl) {
    if (isVercelProduction) problems.push('NEXT_PUBLIC_SITE_URL is required in production')
  } else {
    const parsed = siteUrlSchema.safeParse(rawSiteUrl)
    if (!parsed.success) {
      problems.push('NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL')
    } else {
      const url = new URL(parsed.data)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        problems.push('NEXT_PUBLIC_SITE_URL must use http or https')
      } else if (isVercelProduction && url.protocol !== 'https:') {
        problems.push('NEXT_PUBLIC_SITE_URL must use https in production')
      } else if (isVercelProduction && LOCAL_HOSTS.has(url.hostname)) {
        problems.push('NEXT_PUBLIC_SITE_URL must not point to localhost in production')
      } else {
        siteUrl = parsed.data
      }
    }
  }

  if (problems.length > 0) throw new EnvValidationError(problems)
  return { siteUrl }
}

/**
 * Validated public env for app code. `process.env.NEXT_PUBLIC_*` must be referenced literally
 * so Next.js can inline it into client bundles.
 */
export const publicEnv: PublicEnv = parsePublicEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
})
