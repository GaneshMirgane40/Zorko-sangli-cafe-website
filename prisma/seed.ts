/**
 * Development demo seed (CLAUDE.md §7). Run: `ALLOW_DEMO_SEED=true npm run db:seed`.
 *
 * - Guarded: refuses without ALLOW_DEMO_SEED=true and in production (seed-guard.ts).
 * - Create-only: a row whose slug/key already exists is left untouched, so re-running is safe and
 *   never overwrites or deletes anything (including admin edits and real data).
 * - Never creates an admin user or any password.
 * - Every row has isDemo = true (or belongs to a demo row).
 */
import { scriptClient } from './client'
import {
  demoAddOns,
  demoCafe,
  demoCategories,
  demoHours,
  demoOffers,
  demoRelations,
} from './demo-data'
import { seedRefusalReason } from './seed-guard'

async function main() {
  const refusal = seedRefusalReason(process.env)
  if (refusal) {
    console.error(`Seed refused: ${refusal}`)
    process.exit(1)
  }

  const db = scriptClient()
  const created = { categories: 0, items: 0, offers: 0, relations: 0, cafe: 0, hours: 0 }
  const now = new Date()

  try {
    for (const [ci, cat] of demoCategories.entries()) {
      let category = await db.menuCategory.findUnique({ where: { slug: cat.slug } })
      if (!category) {
        category = await db.menuCategory.create({
          data: { slug: cat.slug, name: cat.name, iconKey: cat.icon, sortOrder: ci, isDemo: true },
        })
        created.categories++
      }

      for (const [ii, item] of cat.items.entries()) {
        if (await db.menuItem.findUnique({ where: { slug: item.slug } })) continue
        // One transaction per item: the item, its image and its add-ons appear together or not at all.
        await db.$transaction(async (tx) => {
          const row = await tx.menuItem.create({
            data: {
              categoryId: category.id,
              slug: item.slug,
              name: item.name,
              description: item.description,
              pricePaise: item.price * 100,
              dietType: item.diet ?? 'VEG',
              isAvailable: item.available ?? true,
              isPublished: item.published ?? true,
              isBestSeller: item.bestSeller ?? false,
              isTrending: item.trending ?? false,
              isFeatured: item.featured ?? false,
              sortOrder: ii,
              isDemo: true,
              images: {
                create: {
                  storagePath: cat.image,
                  altText: `${item.name} — demo placeholder image`,
                  sortOrder: 0,
                },
              },
            },
          })
          for (const [gi, group] of (demoAddOns[item.slug] ?? []).entries()) {
            await tx.addOnGroup.create({
              data: {
                menuItemId: row.id,
                name: group.name,
                minSelect: group.min,
                maxSelect: group.max,
                isRequired: group.min > 0,
                sortOrder: gi,
                options: {
                  create: group.options.map(([name, price], oi) => ({
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

    const ids = new Map(
      (await db.menuItem.findMany({ select: { id: true, slug: true } })).map((r) => [r.slug, r.id]),
    )
    for (const [ri, [from, to, type]] of demoRelations.entries()) {
      const fromItemId = ids.get(from)
      const toItemId = ids.get(to)
      if (!fromItemId || !toItemId) continue
      const result = await db.itemRelation.createMany({
        data: [{ fromItemId, toItemId, type, sortOrder: ri }],
        skipDuplicates: true,
      })
      created.relations += result.count
    }

    for (const [oi, offer] of demoOffers(now).entries()) {
      if (await db.offer.findUnique({ where: { slug: offer.slug } })) continue
      await db.offer.create({
        data: {
          slug: offer.slug,
          kind: offer.kind,
          title: offer.title,
          description: offer.description,
          imagePath: offer.image,
          promoPricePaise: offer.price === null ? null : offer.price * 100,
          startsAt: offer.startsAt,
          endsAt: offer.endsAt,
          isPublished: offer.published,
          isStudentOffer: offer.student ?? false,
          isFeatured: offer.featured ?? false,
          sortOrder: oi,
          isDemo: true,
          items: {
            create: offer.items
              .filter(([slug]) => ids.has(slug))
              .map(([slug, quantity]) => ({ menuItemId: ids.get(slug)!, quantity })),
          },
        },
      })
      created.offers++
    }

    if (!(await db.cafeInformation.findUnique({ where: { id: 'cafe' } }))) {
      await db.cafeInformation.create({ data: { id: 'cafe', ...demoCafe, isDemo: true } })
      created.cafe++
    }
    const hours = await db.openingHours.createMany({ data: demoHours, skipDuplicates: true })
    created.hours = hours.count

    console.log('Demo seed finished (existing rows were left unchanged). Created:', created)
  } finally {
    await db.$disconnect()
  }
}

main().catch((err: unknown) => {
  // Print the error class and Prisma code only; driver messages can include connection details.
  const e = err as { name?: string; code?: string }
  console.error(`Seed failed: ${e?.name ?? 'Error'}${e?.code ? ` (${e.code})` : ''}`)
  process.exit(1)
})
