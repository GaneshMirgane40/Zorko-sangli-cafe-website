import { vi } from 'vitest'

// Route handlers call `connection()` to opt out of prerendering; outside a Next.js request it
// has nothing to do. Everything else in 'next/server' stays real.
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  connection: async () => {},
}))
