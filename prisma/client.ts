/**
 * Prisma client for CLI scripts (seed, remove-demo). The app uses src/server/db.ts instead.
 * Scripts use the direct connection (DIRECT_URL) like migrations do.
 */
import { loadEnvConfig } from '@next/env'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

loadEnvConfig(process.cwd())

export function scriptClient(): PrismaClient {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('DIRECT_URL (or DATABASE_URL) is not set.')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}
