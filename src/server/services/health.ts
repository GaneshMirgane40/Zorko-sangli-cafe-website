import 'server-only'
import { getDb } from '../db'

/** True when a trivial query succeeds within the pool's timeouts. */
export async function databaseIsUp(): Promise<boolean> {
  try {
    await getDb().$queryRaw`SELECT 1` // tagged template = parameterised; no user input
    return true
  } catch {
    return false
  }
}
