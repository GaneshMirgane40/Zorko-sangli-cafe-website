import { apiRoute, ok } from '@/server/http'
import { listCategories } from '@/server/services/categories'

/** GET /api/v1/categories — non-archived categories with public item counts (TRD §6). */
export const GET = apiRoute('GET /api/v1/categories', async () => ok(await listCategories()))
