import 'server-only'
import type { Prisma } from '@/generated/prisma/client'
import { formatRupees, offerStatus } from '@/lib/format'
import { mediaUrl } from '@/lib/media'
import type { OffersQuery } from '@/lib/validation/public'
import { getDb } from '../db'
import { currentOrUpcomingOfferWhere, publicItemWhere } from './visibility'

export type OfferDto = {
  slug: string
  kind: string
  status: 'active' | 'scheduled'
  title: string
  description: string
  image: { url: string; altText: string } | null
  promoPricePaise: number | null
  priceLabel: string | null
  /** Sum of the included items' regular prices × quantity; null when no items are linked. */
  regularPricePaise: number | null
  regularPriceLabel: string | null
  savingsPaise: number | null
  startsAt: string
  endsAt: string
  isStudentOffer: boolean
  isFeatured: boolean
  items: { slug: string; name: string; quantity: number; isAvailable: boolean }[]
}

const offerSelect = {
  slug: true,
  kind: true,
  title: true,
  description: true,
  imagePath: true,
  promoPricePaise: true,
  startsAt: true,
  endsAt: true,
  expiredAt: true,
  isStudentOffer: true,
  isFeatured: true,
  items: {
    where: { menuItem: publicItemWhere },
    orderBy: { menuItem: { name: 'asc' } },
    select: {
      quantity: true,
      menuItem: {
        select: {
          slug: true,
          name: true,
          pricePaise: true,
          isAvailable: true,
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
            select: { storagePath: true, altText: true },
          },
        },
      },
    },
  },
} satisfies Prisma.OfferSelect

type OfferRow = Prisma.OfferGetPayload<{ select: typeof offerSelect }>

function toOffer(row: OfferRow, now: Date): OfferDto | null {
  const status = offerStatus(row, now)
  if (status === 'expired') return null // defence in depth: expired offers are never returned
  const regular = row.items.length
    ? row.items.reduce((sum, i) => sum + i.menuItem.pricePaise * i.quantity, 0)
    : null
  const savings =
    regular !== null && row.promoPricePaise !== null && regular > row.promoPricePaise
      ? regular - row.promoPricePaise
      : null
  // Offer image, else the first included dish's photo (real offers may not have their own yet).
  const url = mediaUrl(row.imagePath)
  const dishImage = row.items
    .map((i) => i.menuItem.images[0])
    .find((img) => mediaUrl(img?.storagePath))
  return {
    slug: row.slug,
    kind: row.kind,
    status,
    title: row.title,
    description: row.description,
    image: url
      ? { url, altText: row.title }
      : dishImage
        ? { url: mediaUrl(dishImage.storagePath)!, altText: dishImage.altText }
        : null,
    promoPricePaise: row.promoPricePaise,
    priceLabel: row.promoPricePaise === null ? null : formatRupees(row.promoPricePaise),
    regularPricePaise: regular,
    regularPriceLabel: regular === null ? null : formatRupees(regular),
    savingsPaise: savings,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    isStudentOffer: row.isStudentOffer,
    isFeatured: row.isFeatured,
    items: row.items.map((i) => ({
      slug: i.menuItem.slug,
      name: i.menuItem.name,
      quantity: i.quantity,
      isAvailable: i.menuItem.isAvailable,
    })),
  }
}

/** Active and scheduled published offers. Expired offers are never listed. */
export async function listOffers(
  query: OffersQuery,
  now = new Date(),
): Promise<{ active: OfferDto[]; scheduled: OfferDto[] }> {
  const rows = await getDb().offer.findMany({
    where: {
      ...currentOrUpcomingOfferWhere(now),
      ...(query.kind ? { kind: query.kind.toUpperCase() as 'DISCOUNT' | 'COMBO' | 'INFO' } : {}),
      ...(query.student ? { isStudentOffer: true } : {}),
    },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { startsAt: 'asc' }, { slug: 'asc' }],
    take: 100, // hard cap; the café has a handful of offers
    select: offerSelect,
  })
  const offers = rows.map((r) => toOffer(r, now)).filter((o): o is OfferDto => o !== null)
  return {
    active: offers.filter((o) => o.status === 'active'),
    scheduled: offers.filter((o) => o.status === 'scheduled'),
  }
}

/** Offer by slug, or null when unpublished, expired or missing. */
export async function getOfferBySlug(slug: string, now = new Date()): Promise<OfferDto | null> {
  const row = await getDb().offer.findFirst({
    where: { ...currentOrUpcomingOfferWhere(now), slug },
    select: offerSelect,
  })
  return row ? toOffer(row, now) : null
}
