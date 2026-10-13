import 'server-only'
import { isOpenNow, minutesToHHMM } from '@/lib/format'
import { getDb } from '../db'

export type CafeDto = {
  name: string
  addressLine: string
  city: string
  postalCode: string | null
  phone: string | null
  email: string | null
  whatsappUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  latitude: number | null
  longitude: number | null
  directionsUrl: string | null
  aboutText: string | null
  studentZoneText: string | null
  offerTerms: string | null
  isPureVegConfirmed: boolean
  /** Which values the café has confirmed. Unverified values must be labelled as placeholders. */
  verified: { address: boolean; contact: boolean; hours: boolean; map: boolean; social: boolean }
  isDemo: boolean
  hours: { dayOfWeek: number; isClosed: boolean; opensAt: string | null; closesAt: string | null }[]
  openNow: boolean
}

/** Café information singleton + 7 days of opening hours, or null if not set up yet. */
export async function getCafeInfo(now = new Date()): Promise<CafeDto | null> {
  const db = getDb()
  const [cafe, hours] = await Promise.all([
    db.cafeInformation.findUnique({ where: { id: 'cafe' } }),
    db.openingHours.findMany({ orderBy: { dayOfWeek: 'asc' } }),
  ])
  if (!cafe) return null

  const lat = cafe.latitude === null ? null : Number(cafe.latitude)
  const lng = cafe.longitude === null ? null : Number(cafe.longitude)
  const directionsUrl =
    lat !== null && lng !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : null

  return {
    name: cafe.name,
    addressLine: cafe.addressLine,
    city: cafe.city,
    postalCode: cafe.postalCode,
    phone: cafe.phone,
    email: cafe.email,
    whatsappUrl: cafe.whatsappNumber ? `https://wa.me/${cafe.whatsappNumber}` : null,
    instagramUrl: cafe.instagramUrl,
    facebookUrl: cafe.facebookUrl,
    latitude: lat,
    longitude: lng,
    directionsUrl,
    aboutText: cafe.aboutText,
    studentZoneText: cafe.studentZoneText,
    offerTerms: cafe.offerTerms,
    isPureVegConfirmed: cafe.isPureVegConfirmed,
    verified: {
      address: cafe.addressVerified,
      contact: cafe.contactVerified,
      hours: cafe.hoursVerified,
      map: cafe.mapVerified,
      social: cafe.socialVerified,
    },
    isDemo: cafe.isDemo,
    hours: hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      isClosed: h.isClosed,
      opensAt: h.isClosed ? null : minutesToHHMM(h.opensAtMin),
      closesAt: h.isClosed ? null : minutesToHHMM(h.closesAtMin),
    })),
    openNow: isOpenNow(hours, now),
  }
}
