/**
 * Removes seeded demonstration rows (isDemo = true) so real content can replace them.
 * Run: `npm run db:remove-demo -- --confirm`. Development or with written team approval only.
 * Real rows (isDemo = false) are never touched. Demo items still used by a real offer are kept
 * (the foreign key is RESTRICT) and reported.
 */
import { scriptClient } from './client'

async function main() {
  if (!process.argv.includes('--confirm')) {
    console.error('Refused: add --confirm to delete all demo rows (isDemo = true).')
    process.exit(1)
  }
  if (process.env.VERCEL_ENV === 'production') {
    console.error('Refused: do not run against production from a deployment environment.')
    process.exit(1)
  }
  const db = scriptClient()
  try {
    const result = await db.$transaction(async (tx) => {
      const offers = await tx.offer.deleteMany({ where: { isDemo: true } })
      const banners = await tx.promotionalBanner.deleteMany({ where: { isDemo: true } })
      const gallery = await tx.galleryImage.deleteMany({ where: { isDemo: true } })
      const feedback = await tx.feedback.deleteMany({ where: { isDemo: true } })
      const items = await tx.menuItem.deleteMany({
        where: { isDemo: true, offers: { none: {} } },
      })
      const categories = await tx.menuCategory.deleteMany({
        where: { isDemo: true, items: { none: {} } },
      })
      return {
        offers: offers.count,
        banners: banners.count,
        gallery: gallery.count,
        feedback: feedback.count,
        items: items.count,
        categories: categories.count,
      }
    })
    const kept = await db.menuItem.count({ where: { isDemo: true } })
    console.log(
      'Removed demo rows:',
      result,
      kept ? `(${kept} demo items kept: still referenced)` : '',
    )
    console.log('Café information and opening hours were kept: edit them in the admin dashboard.')
  } finally {
    await db.$disconnect()
  }
}

main().catch((err: unknown) => {
  const e = err as { name?: string; code?: string }
  console.error(`Remove-demo failed: ${e?.name ?? 'Error'}${e?.code ? ` (${e.code})` : ''}`)
  process.exit(1)
})
