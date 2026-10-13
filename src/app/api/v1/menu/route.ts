import { menuQuerySchema } from '@/lib/validation/public'
import { apiRoute, ok, parseQuery } from '@/server/http'
import { listMenuItems } from '@/server/services/menu'

/** GET /api/v1/menu — search, combined filters, sorting and pagination (TRD §6). */
export const GET = apiRoute('GET /api/v1/menu', async (request) => {
  const query = parseQuery(request, menuQuerySchema)
  const { items, meta } = await listMenuItems(query)
  return ok(items, meta)
})
