import type { Metadata } from 'next'

export const SITE_NAME = 'ZORKO Sangli'

/**
 * Default share image: a 1200×630 crop of the credited "Aloo Tikki Burger" photo
 * (CC BY-SA 4.0, see /credits), so the crop is shared under the same licence.
 */
export const DEFAULT_OG_IMAGE = {
  url: '/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'A veg burger (illustrative photo)',
}

/**
 * Per-page metadata with complete Open Graph and Twitter fields. Next.js replaces (does not
 * merge) a parent's `openGraph` object, so every page builds its own through this helper.
 * Relative URLs resolve against `metadataBase` (NEXT_PUBLIC_SITE_URL, root layout).
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  absoluteTitle = false,
}: {
  title: string
  description: string
  path: string
  image?: { url: string; alt: string } | null
  absoluteTitle?: boolean
}): Metadata {
  const images = [image ?? DEFAULT_OG_IMAGE]
  const shareTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_IN',
      url: path,
      title: shareTitle,
      description,
      images,
    },
    twitter: { card: 'summary_large_image', title: shareTitle, description, images },
  }
}

/** Not-found and utility pages: keep them out of search results. */
export const NO_INDEX: Metadata['robots'] = { index: false, follow: true }
