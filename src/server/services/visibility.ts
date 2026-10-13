import 'server-only'
import type { Prisma } from '@/generated/prisma/client'

/**
 * Single source of truth for "what the public may see" (no duplicated business rules).
 * An item is public when it is published, not archived and its category is not archived.
 * Unavailable items ARE public but are labelled "Out of stock" (never shown as available).
 */
export const publicItemWhere: Prisma.MenuItemWhereInput = {
  isPublished: true,
  isArchived: false,
  category: { isArchived: false },
}

/** Published offers that are active at `now` (start inclusive, end exclusive, not expired early). */
export function activeOfferWhere(now: Date): Prisma.OfferWhereInput {
  return { isPublished: true, expiredAt: null, startsAt: { lte: now }, endsAt: { gt: now } }
}

/** Published offers that have not ended yet (active or scheduled). Expired offers never appear. */
export function currentOrUpcomingOfferWhere(now: Date): Prisma.OfferWhereInput {
  return { isPublished: true, expiredAt: null, endsAt: { gt: now } }
}
