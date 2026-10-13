import 'server-only'
import { z } from 'zod'
import { EnvValidationError } from '@/lib/config/env'

/**
 * Server-only environment (never imported by client components; `server-only` enforces it).
 * Validated lazily on first use so `next build` works without database credentials, and the app
 * fails with a message naming the variable — never its value (CLAUDE.md rule 23).
 */

const postgresUrl = z
  .string()
  .trim()
  .refine((v) => /^postgres(ql)?:\/\//.test(v), 'must be a postgresql:// connection string')

export type ServerEnv = { databaseUrl: string }

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const problems: string[] = []
  const raw = source.DATABASE_URL
  if (!raw?.trim()) problems.push('DATABASE_URL is required (pooled Supabase connection string)')
  else if (!postgresUrl.safeParse(raw).success)
    problems.push('DATABASE_URL must be a postgresql:// connection string')
  if (problems.length > 0) throw new EnvValidationError(problems)
  return { databaseUrl: raw!.trim() }
}

let cached: ServerEnv | undefined
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env)
  return cached
}
