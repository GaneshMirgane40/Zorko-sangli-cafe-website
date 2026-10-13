import { offersQuerySchema } from '@/lib/validation/public'
import { apiRoute, ok, parseQuery } from '@/server/http'
import { listOffers } from '@/server/services/offers'

/** GET /api/v1/offers — active and scheduled offers; expired offers are never returned. */
export const GET = apiRoute('GET /api/v1/offers', async (request) =>
  ok(await listOffers(parseQuery(request, offersQuerySchema))),
)
