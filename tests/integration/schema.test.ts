import { afterAll, describe, expect, it } from 'vitest'
import { Prisma } from '@/generated/prisma/client'
import { toApiError } from '@/server/http'
import { db } from './helpers'

/** Every CHECK / FK / UNIQUE rule must be enforced by the database itself (TC-INT-001..004). */

const DAY = 86_400_000
const someCategoryId = async () => (await db().menuCategory.findFirstOrThrow()).id
const someItem = async () => db().menuItem.findFirstOrThrow({ where: { slug: 'french-fries' } })

/** Runs `fn` and returns the Postgres/Prisma failure so the test can check which rule fired. */
async function rejection(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn()
  } catch (e) {
    return `${(e as { code?: string }).code ?? ''} ${(e as Error).message}`
  }
  throw new Error('expected the database to reject the write')
}

afterAll(async () => {
  await db().menuItem.deleteMany({ where: { slug: { startsWith: 'tmp-' } } })
  await db().offer.deleteMany({ where: { slug: { startsWith: 'tmp-' } } })
})

describe('schema constraints', () => {
  it('rejects a duplicate slug and maps it to 409 (TC-INT-001)', async () => {
    const categoryId = await someCategoryId()
    const err = await db()
      .menuItem.create({
        data: { categoryId, slug: 'french-fries', name: 'Dup', description: 'd', pricePaise: 100 },
      })
      .catch((e: unknown) => e)
    expect(err).toBeInstanceOf(Prisma.PrismaClientKnownRequestError)
    expect(toApiError(err).status).toBe(409)
  })

  it.each([
    ['zero price', { pricePaise: 0 }, 'MenuItem_price_range'],
    ['negative price', { pricePaise: -100 }, 'MenuItem_price_range'],
    ['price above ₹1,00,000', { pricePaise: 10_000_001 }, 'MenuItem_price_range'],
    ['uppercase slug', { slug: 'tmp-Bad' }, 'MenuItem_slug_format'],
    ['blank name', { name: '   ' }, 'MenuItem_name_not_blank'],
  ])('rejects a menu item with %s (TC-INT-002)', async (_label, override, constraint) => {
    const categoryId = await someCategoryId()
    const msg = await rejection(() =>
      db().menuItem.create({
        data: {
          categoryId,
          slug: 'tmp-item',
          name: 'Tmp',
          description: 'd',
          pricePaise: 100,
          ...override,
        },
      }),
    )
    expect(msg).toContain(constraint)
  })

  it('rejects offers with bad dates or a price that does not match the kind (TC-INT-002)', async () => {
    const now = Date.now()
    const base = {
      slug: 'tmp-offer',
      title: 'T',
      description: 'd',
      startsAt: new Date(now),
      endsAt: new Date(now + DAY),
    }
    expect(
      await rejection(() =>
        db().offer.create({
          data: { ...base, kind: 'COMBO', promoPricePaise: 100, endsAt: new Date(now) },
        }),
      ),
    ).toContain('Offer_dates_order')
    expect(
      await rejection(() =>
        db().offer.create({ data: { ...base, kind: 'INFO', promoPricePaise: 100 } }),
      ),
    ).toContain('Offer_price_matches_kind')
    expect(
      await rejection(() =>
        db().offer.create({ data: { ...base, kind: 'DISCOUNT', promoPricePaise: null } }),
      ),
    ).toContain('Offer_price_matches_kind')
  })

  it('rejects out-of-range café coordinates, bad WhatsApp digits and a second café row', async () => {
    expect(
      await rejection(() =>
        db().cafeInformation.update({ where: { id: 'cafe' }, data: { latitude: 91 } }),
      ),
    ).toContain('CafeInformation_latitude_range')
    expect(
      await rejection(() =>
        db().cafeInformation.update({ where: { id: 'cafe' }, data: { longitude: -181 } }),
      ),
    ).toContain('CafeInformation_longitude_range')
    expect(
      await rejection(() =>
        db().cafeInformation.update({ where: { id: 'cafe' }, data: { whatsappNumber: '+91 98' } }),
      ),
    ).toContain('CafeInformation_whatsapp_digits')
    expect(
      await rejection(() =>
        db().cafeInformation.create({
          data: { id: 'other', name: 'x', addressLine: 'x', city: 'x' },
        }),
      ),
    ).toContain('CafeInformation_singleton')
  })

  it('rejects invalid opening hours', async () => {
    expect(
      await rejection(() =>
        db().openingHours.update({
          where: { dayOfWeek: 1 },
          data: { opensAtMin: 1200, closesAtMin: 600 },
        }),
      ),
    ).toContain('OpeningHours_time_range')
    expect(
      await rejection(() =>
        db().openingHours.create({ data: { dayOfWeek: 7, opensAtMin: 0, closesAtMin: 60 } }),
      ),
    ).toContain('OpeningHours_day_range')
  })

  it('rejects self-relations, a 5th image, bad add-on ranges and bad combo quantities', async () => {
    const item = await someItem()
    expect(
      await rejection(() =>
        db().itemRelation.create({
          data: { fromItemId: item.id, toItemId: item.id, type: 'RELATED' },
        }),
      ),
    ).toContain('ItemRelation_not_self')
    expect(
      await rejection(() =>
        db().menuItemImage.create({
          data: {
            menuItemId: item.id,
            storagePath: 'demo/snacks.webp',
            altText: 'x',
            sortOrder: 4,
          },
        }),
      ),
    ).toContain('MenuItemImage_sort_range')
    expect(
      await rejection(() =>
        db().addOnGroup.create({
          data: { menuItemId: item.id, name: 'x', minSelect: 3, maxSelect: 1 },
        }),
      ),
    ).toContain('AddOnGroup_select_range')
    const offer = await db().offer.findFirstOrThrow({ where: { slug: 'burger-fries-combo' } })
    expect(
      await rejection(() =>
        db().offerMenuItem.create({
          data: { offerId: offer.id, menuItemId: item.id, quantity: 21 },
        }),
      ),
    ).toContain('OfferMenuItem_quantity_range')
  })

  it('blocks deleting a category that still has items (TC-INT-003)', async () => {
    const err = await db()
      .menuCategory.delete({ where: { slug: 'burgers' } })
      .catch((e: unknown) => e)
    expect(toApiError(err).status).toBe(409)
    expect(await db().menuCategory.count({ where: { slug: 'burgers' } })).toBe(1)
  })

  it('blocks deleting a menu item that is part of an offer', async () => {
    const err = await db()
      .menuItem.delete({ where: { slug: 'french-fries' } })
      .catch((e: unknown) => e)
    expect(toApiError(err).status).toBe(409)
  })
})
