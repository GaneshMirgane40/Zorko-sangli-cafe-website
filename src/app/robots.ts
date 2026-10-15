import type { MetadataRoute } from 'next'
import { publicEnv } from '@/lib/config/env'

/** /robots.txt: the public site is crawlable; the JSON API, dev pages and the admin area are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/dev/', '/admin'] },
    sitemap: new URL('/sitemap.xml', publicEnv.siteUrl).toString(),
  }
}
