import { getDb } from '@/server/db'

export const db = () => getDb()

const BASE = 'http://localhost:3000'

/** Calls a route handler like Next.js would and returns status + parsed JSON. */
export async function call<C>(
  handler: (req: Request, ctx: C) => Promise<Response>,
  path: string,
  ctx?: C,
  // JSON bodies are checked field by field (or with Zod contracts) in the tests themselves.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ status: number; body: any; headers: Headers }> {
  const res = await handler(new Request(BASE + path), ctx as C)
  return { status: res.status, body: await res.json(), headers: res.headers }
}

export const params = <T extends Record<string, string>>(p: T) => ({ params: Promise.resolve(p) })
