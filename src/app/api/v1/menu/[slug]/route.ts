import { slugSchema } from '@/lib/validation/public'
import { ApiError, apiRoute, ok } from '@/server/http'
import { getMenuItemBySlug } from '@/server/services/menu'

/** GET /api/v1/menu/[slug] — item details; 404 for missing, unpublished or archived items. */
export const GET = apiRoute(
  'GET /api/v1/menu/[slug]',
  async (_request, ctx: RouteContext<'/api/v1/menu/[slug]'>) => {
    const parsed = slugSchema.safeParse((await ctx.params).slug)
    if (!parsed.success) throw new ApiError('VALIDATION_ERROR', 'Invalid item slug.')
    const item = await getMenuItemBySlug(parsed.data)
    if (!item) throw new ApiError('NOT_FOUND', 'Menu item not found.')
    return ok(item)
  },
)
