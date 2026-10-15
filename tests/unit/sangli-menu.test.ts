import { describe, expect, it } from 'vitest'
import { sangliCafe, sangliMenu, slugify } from '../../prisma/data/sangli-menu'

/** Sanity checks on the transcribed outlet menu (ADR-044). */
describe('real Sangli menu data', () => {
  const items = sangliMenu.flatMap((c) => c.items)

  it('has unique, URL-safe slugs that pass the database CHECK', () => {
    const slugs = items.map((i) => slugify(i.name))
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of [...slugs, ...sangliMenu.map((c) => c.slug)])
      expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    expect(slugify('Ala Rosey (Pink Sauce)')).toBe('ala-rosey-pink-sauce')
    expect(slugify('Cheese Pull & Tear Garlic Bun')).toBe('cheese-pull-and-tear-garlic-bun')
  })

  it('has whole-rupee prices within the database range and valid add-ons', () => {
    expect(items).toHaveLength(65)
    for (const i of items) {
      expect(Number.isInteger(i.price) && i.price > 0 && i.price <= 100_000).toBe(true)
      expect(i.name.length).toBeLessThanOrEqual(80)
      expect(i.desc.length).toBeLessThanOrEqual(600)
      for (const g of i.addOns ?? []) {
        expect(g.min).toBeLessThanOrEqual(g.max)
        for (const [, p] of g.options) expect(p).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('matches a few prices printed on the menu', () => {
    const price = (name: string) => items.find((i) => i.name === name)?.price
    expect(price('Classic Burger')).toBe(49)
    expect(price('Paneer Barbeque Pizza')).toBe(189)
    expect(price('Kulhad Maggi')).toBe(99)
    expect(price('KitKat Chocolate Shake')).toBe(109)
    expect(price('Special Tea')).toBe(19)
  })

  it('uses the outlet details printed on the menu', () => {
    expect(sangliCafe.postalCode).toBe('416415')
    expect(sangliCafe.phone).toBe('+919890011348')
  })
})

describe('illustrative photos (ADR-045)', () => {
  it('every photo used by the menu exists, is credited and has an allowed licence', async () => {
    const { existsSync } = await import('node:fs')
    const { STOCK } = await import('../../prisma/data/sangli-menu')
    const credits = (await import('@/lib/site/image-credits.json')).default
    const used = new Set(
      sangliMenu.flatMap((c) => [c.image, ...c.items.map((i) => i.image ?? c.image)]),
    )
    for (const key of used) {
      expect(existsSync(`public/stock/${key}.webp`), key).toBe(true)
      expect(
        credits.find((c) => c.key === key),
        key,
      ).toBeDefined()
    }
    expect(Object.keys(STOCK).sort()).toEqual(credits.map((c) => c.key).sort())
    for (const c of credits) {
      expect(c.license).toMatch(/^(CC0|Public domain|CC BY(-SA)? (2\.0|2\.5|3\.0|4\.0))$/)
      expect(c.source).toMatch(/^https:\/\/commons\.wikimedia\.org\//)
    }
  })
})
