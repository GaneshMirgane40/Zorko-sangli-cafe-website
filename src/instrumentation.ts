/**
 * Runs once when the server starts (Next.js instrumentation hook).
 * Validates environment configuration early so a misconfigured deployment fails fast with a
 * message naming the missing/invalid variable (values are never printed).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@/lib/config/env')
  }
}
