import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'prisma/config'

// Prisma 7 no longer reads .env files itself. Reuse Next.js's loader so the CLI sees the same
// .env.local as the app. Variables already set in the shell win (used by the integration tests).
loadEnvConfig(process.cwd())

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // The CLI (migrate, db pull) uses the DIRECT (non-pooled) connection. The app uses the pooled
  // DATABASE_URL through the pg driver adapter in src/server/db.ts.
  datasource: { url: process.env.DIRECT_URL },
})
