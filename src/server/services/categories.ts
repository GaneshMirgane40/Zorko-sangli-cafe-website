import 'server-only'
import { getDb } from '../db'
import { publicItemWhere } from './visibility'

export type CategoryDto = {
  id: string
  slug: string
  name: string
  description: string | null
  iconKey: string
  itemCount: number
}

/** Non-archived categories in display order, with the number of publicly visible items. */
export async function listCategories(): Promise<CategoryDto[]> {
  const rows = await getDb().menuCategory.findMany({
    where: { isArchived: false },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      iconKey: true,
      _count: { select: { items: { where: publicItemWhere } } },
    },
  })
  return rows.map(({ _count, ...c }) => ({ ...c, itemCount: _count.items }))
}
