import type { Metadata } from 'next'
import { connection } from 'next/server'
import { AdminMenuTable, type CategoryOption, type MenuItemRow } from '@/features/admin/menu-table'
import { requireAdmin } from '@/server/auth/admin'
import { getDb } from '@/server/db'

export const metadata: Metadata = { title: 'Menu Management' }

export default async function AdminMenuPage() {
  await connection()
  await requireAdmin('/admin/menu')

  const db = getDb()
  const [items, categories] = await Promise.all([
    db.menuItem.findMany({
      where: { isArchived: false },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        pricePaise: true,
        dietType: true,
        isAvailable: true,
        isBestSeller: true,
        isTrending: true,
        isFeatured: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    db.menuCategory.findMany({
      where: { isArchived: false },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ])

  const formattedItems: MenuItemRow[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    priceRupees: item.pricePaise / 100,
    dietType: item.dietType as 'VEG' | 'NON_VEG' | 'EGG',
    isAvailable: item.isAvailable,
    isBestSeller: item.isBestSeller,
    isTrending: item.isTrending,
    isFeatured: item.isFeatured,
    category: item.category,
  }))

  const formattedCategories: CategoryOption[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }))

  return (
    <div className="flex flex-col gap-space-xl">
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-lg-mobile md:text-headline-lg">Menu Management</h1>
        <p className="text-body-md text-on-surface-variant">
          Update prices, toggle items in or out of stock with one click, or add new dishes to the
          ZORKO Sangli live digital menu.
        </p>
      </header>

      <AdminMenuTable
        initialItems={formattedItems}
        categories={formattedCategories}
      />
    </div>
  )
}

