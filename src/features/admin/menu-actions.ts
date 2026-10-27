'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { recordAudit } from '@/server/audit'
import { requireAdmin } from '@/server/auth/admin'
import { getDb } from '@/server/db'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Toggle item availability (In Stock / Out of Stock) */
export async function toggleItemAvailability(itemId: string) {
  const admin = await requireAdmin('/admin/menu')
  const db = getDb()

  const current = await db.menuItem.findUnique({
    where: { id: itemId },
    select: { id: true, name: true, isAvailable: true },
  })

  if (!current) throw new Error('Menu item not found')

  const updated = await db.menuItem.update({
    where: { id: itemId },
    data: { isAvailable: !current.isAvailable },
  })

  await recordAudit({
    adminUserId: admin.id,
    action: 'MENU_ITEM_UPDATED',
    entityType: 'menu_item',
    entityId: itemId,
    summary: `Set "${current.name}" availability to ${updated.isAvailable ? 'In Stock' : 'Out of Stock'}`,
  })

  revalidatePath('/admin/menu')
  revalidatePath('/menu')
  revalidatePath('/')
  return { success: true, isAvailable: updated.isAvailable }
}

/** Update item price in ₹ */
export async function updateItemPrice(itemId: string, priceRupees: number) {
  const admin = await requireAdmin('/admin/menu')
  const db = getDb()

  if (priceRupees < 1 || priceRupees > 5000) {
    throw new Error('Price must be between ₹1 and ₹5,000')
  }

  const current = await db.menuItem.findUnique({
    where: { id: itemId },
    select: { id: true, name: true, pricePaise: true },
  })

  if (!current) throw new Error('Menu item not found')

  const newPaise = Math.round(priceRupees * 100)
  await db.menuItem.update({
    where: { id: itemId },
    data: { pricePaise: newPaise },
  })

  await recordAudit({
    adminUserId: admin.id,
    action: 'MENU_ITEM_UPDATED',
    entityType: 'menu_item',
    entityId: itemId,
    summary: `Updated price for "${current.name}" from ₹${current.pricePaise / 100} to ₹${priceRupees}`,
  })

  revalidatePath('/admin/menu')
  revalidatePath('/menu')
  revalidatePath('/')
  return { success: true }
}

/** Toggle badges: Best Seller, Trending, Featured */
export async function toggleItemFlag(
  itemId: string,
  field: 'isBestSeller' | 'isTrending' | 'isFeatured',
) {
  const admin = await requireAdmin('/admin/menu')
  const db = getDb()

  const current = await db.menuItem.findUnique({
    where: { id: itemId },
    select: { id: true, name: true, [field]: true },
  })

  if (!current) throw new Error('Menu item not found')

  const nextVal = !(current as any)[field]
  await db.menuItem.update({
    where: { id: itemId },
    data: { [field]: nextVal },
  })

  await recordAudit({
    adminUserId: admin.id,
    action: 'MENU_ITEM_UPDATED',
    entityType: 'menu_item',
    entityId: itemId,
    summary: `Toggled ${field} for "${current.name}" to ${nextVal}`,
  })

  revalidatePath('/admin/menu')
  revalidatePath('/menu')
  revalidatePath('/')
  return { success: true }
}

const createItemSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  categoryId: z.string().min(1, 'Please select a category'),
  priceRupees: z.coerce.number().min(1, 'Price must be at least ₹1').max(5000),
  description: z.string().trim().max(600).default(''),
  dietType: z.enum(['VEG', 'NON_VEG', 'EGG']).default('VEG'),
  isAvailable: z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
})

export type CreateItemState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
}

/** Create a new menu item */
export async function createMenuItemAction(
  _prev: CreateItemState,
  formData: FormData,
): Promise<CreateItemState> {
  const admin = await requireAdmin('/admin/menu')
  const db = getDb()

  const raw = {
    name: formData.get('name'),
    categoryId: formData.get('categoryId'),
    priceRupees: formData.get('priceRupees'),
    description: formData.get('description'),
    dietType: formData.get('dietType'),
    isAvailable: formData.get('isAvailable') === 'on',
    isBestSeller: formData.get('isBestSeller') === 'on',
    isTrending: formData.get('isTrending') === 'on',
    isFeatured: formData.get('isFeatured') === 'on',
  }

  const parsed = createItemSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const baseSlug = slugify(parsed.data.name)
    let slug = baseSlug
    let counter = 1
    while (await db.menuItem.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const item = await db.menuItem.create({
      data: {
        name: parsed.data.name,
        slug,
        categoryId: parsed.data.categoryId,
        description: parsed.data.description,
        pricePaise: Math.round(parsed.data.priceRupees * 100),
        dietType: parsed.data.dietType,
        isAvailable: parsed.data.isAvailable,
        isPublished: true,
        isArchived: false,
        isBestSeller: parsed.data.isBestSeller,
        isTrending: parsed.data.isTrending,
        isFeatured: parsed.data.isFeatured,
      },
    })

    await recordAudit({
      adminUserId: admin.id,
      action: 'MENU_ITEM_CREATED',
      entityType: 'menu_item',
      entityId: item.id,
      summary: `Created new menu item "${item.name}" (₹${parsed.data.priceRupees})`,
    })

    revalidatePath('/admin/menu')
    revalidatePath('/menu')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('Failed to create menu item:', err)
    return {
      success: false,
      error: 'Failed to create menu item. Please try again.',
    }
  }
}

/** Soft-archive / delete item */
export async function deleteMenuItemAction(itemId: string) {
  const admin = await requireAdmin('/admin/menu')
  const db = getDb()

  const current = await db.menuItem.findUnique({
    where: { id: itemId },
    select: { id: true, name: true },
  })

  if (!current) throw new Error('Menu item not found')

  await db.menuItem.update({
    where: { id: itemId },
    data: { isArchived: true, isPublished: false },
  })

  await recordAudit({
    adminUserId: admin.id,
    action: 'MENU_ITEM_DELETED',
    entityType: 'menu_item',
    entityId: itemId,
    summary: `Archived menu item "${current.name}"`,
  })

  revalidatePath('/admin/menu')
  revalidatePath('/menu')
  revalidatePath('/')
  return { success: true }
}

