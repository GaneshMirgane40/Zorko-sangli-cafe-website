import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

/**
 * Integration tests: real Postgres (the local throwaway container from scripts/test-db.sh,
 * migrated and seeded by `npm run test:db:reset`). Never a Supabase project.
 */
const TEST_DB = 'postgresql://zorko_test:zorko_test@127.0.0.1:54329/zorko_test'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(new URL('./node_modules/server-only/empty.js', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts', 'tests/supabase/**/*.test.ts'],
    setupFiles: ['./tests/integration/setup.ts'],
    env: { DATABASE_URL: TEST_DB, DIRECT_URL: TEST_DB },
    fileParallelism: false, // tests share one database
    testTimeout: 20_000,
  },
})
