import 'server-only'
import { EnvValidationError } from '@/lib/config/env'

/**
 * Auth environment (Phase 5A). Read on the server only: the browser never talks to Supabase
 * Auth directly (login and logout are Server Actions), so no key is shipped to the client.
 * Validated lazily so `next build` works without credentials; errors name variables, never values.
 */
export type AuthEnv = { supabaseUrl: string; supabaseKey: string; rateLimitSalt: string }

export function parseAuthEnv(source: Record<string, string | undefined>): AuthEnv {
  const problems: string[] = []
  // Only the origin is used: the variable is sometimes set to the REST URL (…/rest/v1/).
  let url: string | undefined
  try {
    const parsed = new URL(source.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '')
    if (parsed.protocol === 'https:') url = parsed.origin
  } catch {}
  const key = source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  const salt = source.RATE_LIMIT_SALT?.trim()
  if (!url)
    problems.push('NEXT_PUBLIC_SUPABASE_URL must be the https:// URL of the Supabase project')
  if (!key) problems.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required')
  if (!salt || salt.length < 32)
    problems.push('RATE_LIMIT_SALT is required (at least 32 characters; `openssl rand -hex 32`)')
  if (problems.length > 0) throw new EnvValidationError(problems)
  return { supabaseUrl: url!, supabaseKey: key!, rateLimitSalt: salt! }
}

let cached: AuthEnv | undefined
export function getAuthEnv(): AuthEnv {
  cached ??= parseAuthEnv(process.env)
  return cached
}

/** Only the rate-limit salt (the limiter does not need Supabase). */
export function getRateLimitSalt(): string {
  const salt = process.env.RATE_LIMIT_SALT?.trim()
  if (!salt || salt.length < 32)
    throw new EnvValidationError([
      'RATE_LIMIT_SALT is required (at least 32 characters; `openssl rand -hex 32`)',
    ])
  return salt
}
