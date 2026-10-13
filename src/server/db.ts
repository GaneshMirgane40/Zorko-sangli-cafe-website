import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { getServerEnv } from './env'

/**
 * Prisma client singleton (Prisma 7 + `pg` driver adapter, TRD §3).
 *
 * Runtime uses the pooled DATABASE_URL (Supabase transaction pooler). `pg` uses unnamed prepared
 * statements, which the transaction pooler supports. The client is cached on globalThis: one pool
 * per server instance, and dev hot reloads do not open a new pool each time.
 *
 * Only `src/server/**` may import this module.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: getServerEnv().databaseUrl,
    max: 5, // serverless functions: keep each instance's pool small
    connectionTimeoutMillis: 5_000,
    statement_timeout: 10_000, // abort runaway queries (SECURITY.md: timeouts)
  })
  return new PrismaClient({ adapter })
}

export function getDb(): PrismaClient {
  globalForPrisma.prisma ??= createClient()
  return globalForPrisma.prisma
}
