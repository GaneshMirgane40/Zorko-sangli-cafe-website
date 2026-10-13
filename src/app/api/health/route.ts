import { connection } from 'next/server'
import packageJson from '../../../../package.json'
import { databaseIsUp } from '@/server/services/health'

/**
 * GET /api/health — liveness + database round-trip (TRD §6).
 * 200 `{status:"ok", db:"ok"}` or 503 `{status:"degraded", db:"down"}`.
 * Returns no secrets, connection details or error messages.
 */
export async function GET() {
  // Opt out of build-time prerendering: health must reflect the running server.
  await connection()
  const dbUp = await databaseIsUp()

  return Response.json(
    {
      status: dbUp ? 'ok' : 'degraded',
      db: dbUp ? 'ok' : 'down',
      version: packageJson.version,
      time: new Date().toISOString(),
    },
    { status: dbUp ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
