import { connection } from 'next/server'
import packageJson from '../../../../package.json'

/**
 * GET /api/health — liveness check (TRD §6).
 * Phase 2: app only. Phase 3 adds a database round-trip and reports `db: "ok" | "down"`.
 * Returns no secrets or environment details.
 */
export async function GET() {
  // Opt out of build-time prerendering: health must reflect the running server.
  await connection()

  return Response.json(
    { status: 'ok', version: packageJson.version, time: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
