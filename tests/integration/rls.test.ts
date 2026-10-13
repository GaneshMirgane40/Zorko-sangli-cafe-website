import { describe, expect, it } from 'vitest'
import { db } from './helpers'

/**
 * RLS deny-all at the database level (TC-SEC-022). The `anon` and `authenticated` roles are the
 * ones Supabase's REST/GraphQL API uses; the test container recreates them. The live check
 * against the Supabase API itself is TC-SEC-020 (supabase-rest.test.ts).
 */

const tables = async () =>
  db().$queryRaw<{ tablename: string; rowsecurity: boolean }[]>`
    SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`

/** Runs one statement as `role` inside a rolled-back transaction; returns the error code. */
async function asRole(role: 'anon' | 'authenticated', sql: string): Promise<string | null> {
  try {
    await db().$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`) // fixed literals only, no user input
      await tx.$queryRawUnsafe(sql)
      throw new Error('ROLLBACK_OK')
    })
  } catch (e) {
    const msg = (e as Error).message
    if (msg.includes('ROLLBACK_OK')) return null
    return msg.includes('permission denied') ? 'permission denied' : msg
  }
  return null
}

describe('row level security deny-all (TC-SEC-022)', () => {
  it('has RLS enabled on every table in the public schema', async () => {
    const rows = await tables()
    expect(rows.length).toBeGreaterThanOrEqual(17)
    expect(rows.filter((r) => !r.rowsecurity).map((r) => r.tablename)).toEqual([])
  })

  it('has no RLS policies at all (nothing is opened to API roles)', async () => {
    const policies = await db().$queryRaw<{ n: bigint }[]>`
      SELECT count(*) AS n FROM pg_policies WHERE schemaname = 'public'`
    expect(Number(policies[0].n)).toBe(0)
  })

  for (const role of ['anon', 'authenticated'] as const) {
    it(`denies ${role} reads and writes on every table`, async () => {
      for (const { tablename } of await tables()) {
        const t = `"public"."${tablename}"`
        expect(await asRole(role, `SELECT * FROM ${t} LIMIT 1`), `${role} SELECT ${t}`).toBe(
          'permission denied',
        )
        expect(await asRole(role, `DELETE FROM ${t}`), `${role} DELETE ${t}`).toBe(
          'permission denied',
        )
      }
      expect(
        await asRole(
          role,
          `INSERT INTO "Feedback" (id, message, "updatedAt") VALUES ('x','x', now())`,
        ),
      ).toBe('permission denied')
    })
  }
})
