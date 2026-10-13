/**
 * Refuses to run the demo seed unless it is clearly safe (CLAUDE.md §7, rule 14).
 * Pure function so it can be unit-tested.
 */
export function seedRefusalReason(env: Record<string, string | undefined>): string | null {
  if (env.ALLOW_DEMO_SEED !== 'true') {
    return 'Set ALLOW_DEMO_SEED=true to confirm this is a development database.'
  }
  if (env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production') {
    return 'The demo seed never runs in production.'
  }
  if (!env.DIRECT_URL && !env.DATABASE_URL) {
    return 'DIRECT_URL (or DATABASE_URL) is not set.'
  }
  return null
}
