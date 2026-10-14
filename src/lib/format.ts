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

/** Minutes from midnight → "10:30 AM" (UI copy, IST). 0 and 1440 are both "12:00 AM". */
export function formatTime12(minutes: number): string {
  const [h, m] = minutesToHHMM(minutes).split(':').map(Number)
  const hour = h % 24
  const suffix = hour < 12 ? 'AM' : 'PM'
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

/** "10:30 AM – 11:00 PM", or null when the day is closed. */
export function formatHoursRange(day: DayHours | undefined): string | null {
  if (!day || day.isClosed) return null
  return `${formatTime12(day.opensAtMin)} – ${formatTime12(day.closesAtMin)}`
}

/** "31 Oct 2026" in IST. */
export function formatDateIST(iso: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso))
}

/** "+919890011348" → "+91 98900 11348" for display; other formats are shown unchanged. */
export function formatPhone(phone: string): string {
  const m = /^\+91(\d{5})(\d{5})$/.exec(phone.replace(/\s/g, ''))
  return m ? `+91 ${m[1]} ${m[2]}` : phone
}
