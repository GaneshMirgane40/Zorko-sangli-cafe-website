/**
 * Imports the REAL Sangli menu and outlet details (prisma/data/sangli-menu.ts, ADR-044).
 * Run: `npm run db:import-menu`. Development project; production only with written team
 * approval (CLAUDE.md rule 14) — refused when NODE_ENV/VERCEL_ENV is production.
 *
 * - Create-only by slug: existing categories/items (including admin edits) are never changed.
 * - Refuses while demo menu items exist, so real and demo items are never mixed
 *   (run `npm run db:remove-demo -- --confirm` first).
 * - Re-running upgrades our earlier "photo coming soon" tiles to the illustrative photos (ADR-045).
 * - Café information: replaces the row only while it is still demo data; hours are kept
 *   (still unconfirmed, Q-05).
 */
import { scriptClient } from './client'
import { sangliCafe, sangliMenu, slugify, stockAlt, stockPath } from './data/sangli-menu'

async function main() {
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    console.error('Refused: run imports against production only via the Phase 8 procedure.')
    process.exit(1)
  }
  const db = scriptClient()
  try {
    const demoItems = await db.menuItem.count({ where: { isDemo: true } })
    if (demoItems > 0) {
      console.error(
        `Refused: ${demoItems} demo menu items exist. Run \`npm run db:remove-demo -- --confirm\` first.`,
      )
      process.exit(1)
    }

    const created = { categories: 0, items: 0, skipped: 0, photosUpgraded: 0, cafe: 'unchanged' }
    for (const [ci, cat] of sangliMenu.entries()) {
      let category = await db.menuCategory.findUnique({ where: { slug: cat.slug } })
      if (!category) {
        category = await db.menuCategory.create({
          data: {
            slug: cat.slug,
            name: cat.name,
            description: cat.note ?? null,
            iconKey: cat.icon,
            sortOrder: ci,
          },
        })
        created.categories++
      }
      for (const [ii, item] of cat.items.entries()) {
        const slug = slugify(item.name)
        const photo = item.image ?? cat.image
        const existing = await db.menuItem.findUnique({ where: { slug }, select: { id: true } })
        if (existing) {
          // Only upgrade our own "photo coming soon" tiles; never touch admin-uploaded images.
          const upgraded = await db.menuItemImage.updateMany({
            where: { menuItemId: existing.id, storagePath: { startsWith: 'placeholder/' } },
            data: { storagePath: stockPath(photo), altText: stockAlt(photo) },
          })
          created.photosUpgraded += upgraded.count
          created.skipped++
          continue
        }
        const tags = item.tags ?? []
        await db.$transaction(async (tx) => {
          const row = await tx.menuItem.create({
            data: {
              categoryId: category.id,
              slug,
              name: item.name,
              description: item.desc,
              pricePaise: item.price * 100,
              dietType: 'VEG',
              isBestSeller: tags.includes('best'),
              isTrending: tags.includes('must'),
              isFeatured: tags.includes('new'),
              sortOrder: ii,
              images: {
                create: { storagePath: stockPath(photo), altText: stockAlt(photo), sortOrder: 0 },
              },
            },
          })
          for (const [gi, g] of (item.addOns ?? []).entries()) {
            await tx.addOnGroup.create({
              data: {
                menuItemId: row.id,
                name: g.name,
                minSelect: g.min,
                maxSelect: g.max,
                isRequired: g.min > 0,
                sortOrder: gi,
                options: {
                  create: g.options.map(([name, price], oi) => ({
                    name,
                    priceDeltaPaise: price * 100,
                    sortOrder: oi,
                  })),
                },
              },
            })
          }
        })
        created.items++
      }
    }

    const cafe = await db.cafeInformation.findUnique({ where: { id: 'cafe' } })
    const cafeData = {
      ...sangliCafe,
      aboutText: 'ZORKO Sangli is the ZORKO outlet at Vishrambag, Sangli.',
      studentZoneText: null,
      offerTerms: null,
      isDemo: false,
    }
    if (!cafe) {
      await db.cafeInformation.create({ data: { id: 'cafe', ...cafeData } })
      created.cafe = 'created'
    } else if (cafe.isDemo) {
      await db.cafeInformation.update({ where: { id: 'cafe' }, data: cafeData })
      created.cafe = 'replaced demo row'
    }
    console.log('Sangli menu import finished:', created)
  } finally {
    await db.$disconnect()
  }
}

main().catch((err: unknown) => {
  const e = err as { name?: string; code?: string }
  console.error(`Import failed: ${e?.name ?? 'Error'}${e?.code ? ` (${e.code})` : ''}`)
  process.exit(1)
})
