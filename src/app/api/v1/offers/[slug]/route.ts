import { slugSchema } from '@/lib/validation/public'
import { ApiError, apiRoute, ok } from '@/server/http'
import { getOfferBySlug } from '@/server/services/offers'

/** GET /api/v1/offers/[slug] — 404 for missing, unpublished or expired offers. */
export const GET = apiRoute(
  'GET /api/v1/offers/[slug]',
  async (_request, ctx: RouteContext<'/api/v1/offers/[slug]'>) => {
    const parsed = slugSchema.safeParse((await ctx.params).slug)
    if (!parsed.success) throw new ApiError('VALIDATION_ERROR', 'Invalid offer slug.')
    const offer = await getOfferBySlug(parsed.data)
    if (!offer) throw new ApiError('NOT_FOUND', 'Offer not found.')
    return ok(offer)
  },
)
