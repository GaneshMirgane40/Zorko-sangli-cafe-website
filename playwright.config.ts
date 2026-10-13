import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const baseURL = `http://localhost:${PORT}`

/**
 * E2E runs against a production build (`next build && next start`), never the dev server, so
 * headers, caching and error pages behave as in production. ENABLE_STYLEGUIDE exposes the
 * dev-only /dev/styleguide page in that build. The server talks to the local test database, so
 * Docker must be running (`npm run test:e2e` starts and seeds it).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      ENABLE_STYLEGUIDE: 'true',
      // The local throwaway test database (scripts/test-db.sh), migrated + seeded by
      // `npm run test:e2e`. Never a Supabase project.
      DATABASE_URL: 'postgresql://zorko_test:zorko_test@127.0.0.1:54329/zorko_test',
      NEXT_PUBLIC_SITE_URL: baseURL,
    },
  },
})
