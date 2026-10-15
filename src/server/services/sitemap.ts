import 'server-only'
import { getDb } from '../db'
import { currentOrUpcomingOfferWhere, publicItemWhere } from './visibility'

export type SitemapEntryDto = { path: string; updatedAt: string }

/**
 * Public detail pages for sitemap.xml: visible dishes and offers that have not ended.
 * Uses the same visibility rules as the pages, so the sitemap never lists a page that would
 * show "not found". Capped defensively; a café menu has tens of entries, not thousands.
 */
export async function listSitemapEntries(now = new Date()): Promise<SitemapEntryDto[]> {
  const db = getDb()
  const [items, offers] = await Promise.all([
    db.menuItem.findMany({
      where: publicItemWhere,
      orderBy: { slug: 'asc' },
      take: 1000,
      select: { slug: true, updatedAt: true },
    }),
    db.offer.findMany({
      where: currentOrUpcomingOfferWhere(now),
      orderBy: { slug: 'asc' },
      take: 200,
      select: { slug: true, updatedAt: true },
    }),
  ])
  return [
    ...items.map((i) => ({ path: `/menu/${i.slug}`, updatedAt: i.updatedAt.toISOString() })),
    ...offers.map((o) => ({ path: `/offers/${o.slug}`, updatedAt: o.updatedAt.toISOString() })),
  ]
}
