/**
 * Formats integer paise as rupees per DESIGN.md: symbol flush to the number, Indian digit
 * grouping, decimals only when needed. 14900 → "₹149", 14950 → "₹149.50", 1250000 → "₹12,500".
 */
export function formatRupees(paise: number): string {
  if (!Number.isInteger(paise)) throw new TypeError('formatRupees expects integer paise')
  const rupees = paise / 100
  const hasFraction = paise % 100 !== 0
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}

/** Offer lifecycle (FR offers): admin early-expiry wins; `endsAt` is exclusive. */
export type OfferStatus = 'scheduled' | 'active' | 'expired'

export function offerStatus(
  offer: { startsAt: Date; endsAt: Date; expiredAt?: Date | null },
  now: Date = new Date(),
): OfferStatus {
  if (offer.expiredAt && offer.expiredAt <= now) return 'expired'
  if (now >= offer.endsAt) return 'expired'
  if (now < offer.startsAt) return 'scheduled'
  return 'active'
}

/** 0–1440 minutes from midnight → "HH:MM" (1440 → "24:00"). */
export function minutesToHHMM(minutes: number): string {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1440) {
    throw new RangeError('minutes must be an integer between 0 and 1440')
  }
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Day of week (0 = Sunday) and minutes since midnight in India Standard Time. */
export function istClock(now: Date = new Date()): { dayOfWeek: number; minutes: number } {
  // IST is UTC+05:30 all year (no daylight saving), so a fixed offset is exact.
  const ist = new Date(now.getTime() + 330 * 60_000)
  return { dayOfWeek: ist.getUTCDay(), minutes: ist.getUTCHours() * 60 + ist.getUTCMinutes() }
}

export type DayHours = {
  dayOfWeek: number
  opensAtMin: number
  closesAtMin: number
  isClosed: boolean
}

/** Whether the café is open at `now` (IST). Same-day ranges only; past-midnight hours are Q-05. */
export function isOpenNow(hours: DayHours[], now: Date = new Date()): boolean {
  const { dayOfWeek, minutes } = istClock(now)
  const today = hours.find((h) => h.dayOfWeek === dayOfWeek)
  if (!today || today.isClosed) return false
  return minutes >= today.opensAtMin && minutes < today.closesAtMin
}
