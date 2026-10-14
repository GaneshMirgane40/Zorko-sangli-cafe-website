import type { CafeDto } from '@/server/services/cafe'
import { formatTime12, istClock } from '@/lib/format'

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** "10:30 AM – 11:00 PM" for one day of CafeDto.hours, or null when closed / not set. */
export function hoursLabel(day: CafeDto['hours'][number] | undefined): string | null {
  if (!day || day.isClosed || !day.opensAt || !day.closesAt) return null
  return `${formatTime12(toMinutes(day.opensAt))} – ${formatTime12(toMinutes(day.closesAt))}`
}

/** Today's hours in IST plus whether they are confirmed by the café (UI must say if not). */
export function todayHours(cafe: Pick<CafeDto, 'hours' | 'verified'>, now = new Date()) {
  const { dayOfWeek } = istClock(now)
  const label = hoursLabel(cafe.hours.find((h) => h.dayOfWeek === dayOfWeek))
  return { label, verified: cafe.verified.hours }
}
