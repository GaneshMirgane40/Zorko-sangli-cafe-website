import { ApiError, apiRoute, ok } from '@/server/http'
import { getCafeInfo } from '@/server/services/cafe'

/** GET /api/v1/cafe — café details, 7-day opening hours and open-now state (IST). */
export const GET = apiRoute('GET /api/v1/cafe', async () => {
  const cafe = await getCafeInfo()
  if (!cafe) throw new ApiError('NOT_FOUND', 'Café information has not been set up yet.')
  return ok(cafe)
})
