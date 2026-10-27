import { scriptClient } from './client'

export interface GalleryItemData {
  storagePath: string
  altText: string
  caption: string
  sortOrder: number
}

// Curated authentic real photos of ZORKO Sangli
const authenticGalleryItems: GalleryItemData[] = [
  {
    storagePath: 'stock/zorko-cafe-dining-hall.webp',
    altText: 'ZORKO Sangli grand dining hall with botanical ceiling runner, timber pergola and teal velvet armchairs',
    caption: 'Grand dining hall with botanical ceiling greenery & warm arched ambient lighting',
    sortOrder: 1,
  },
  {
    storagePath: 'stock/zorko-cafe-blue-lounge.webp',
    altText: 'ZORKO Sangli royal blue leather booth seating with quilted armchairs and round marble tables',
    caption: 'Royal blue leather booth lounge with marble bistro tables & framed art',
    sortOrder: 2,
  },
]

async function seed() {
  const db = scriptClient()
  try {
    // Clear out old gallery images to keep only curated authentic photos
    await db.galleryImage.deleteMany({})
    console.log('Cleared existing gallery images')

    for (const item of authenticGalleryItems) {
      await db.galleryImage.create({
        data: {
          storagePath: item.storagePath,
          altText: item.altText,
          caption: item.caption,
          sortOrder: item.sortOrder,
          isPublished: true,
          isDemo: false,
        },
      })
      console.log(`Created authentic gallery image: ${item.storagePath} (#${item.sortOrder})`)
    }

    const count = await db.galleryImage.count({ where: { isPublished: true } })
    console.log(`Successfully seeded ${count} authentic gallery photos.`)
  } finally {
    await db.$disconnect()
  }
}

seed().catch(console.error)
