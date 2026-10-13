import { describe, expect, it } from 'vitest'
import { istClock, isOpenNow, minutesToHHMM, offerStatus } from '@/lib/format'

const d = (iso: string) => new Date(iso)

describe('offerStatus (TC-UNIT-020)', () => {
  const offer = { startsAt: d('2026-10-01T00:00:00Z'), endsAt: d('2026-10-31T00:00:00Z') }
  it('is scheduled before the start', () =>
    expect(offerStatus(offer, d('2026-09-30T23:59:59Z'))).toBe('scheduled'))
  it('is active from the start instant (inclusive)', () =>
    expect(offerStatus(offer, d('2026-10-01T00:00:00Z'))).toBe('active'))
  it('is expired at the end instant (exclusive)', () =>
    expect(offerStatus(offer, d('2026-10-31T00:00:00Z'))).toBe('expired'))
  it('is expired when an admin expired it early', () =>
    expect(
      offerStatus({ ...offer, expiredAt: d('2026-10-05T00:00:00Z') }, d('2026-10-10T00:00:00Z')),
    ).toBe('expired'))
  it('ignores an early-expiry time that is still in the future', () =>
    expect(
      offerStatus({ ...offer, expiredAt: d('2026-10-20T00:00:00Z') }, d('2026-10-10T00:00:00Z')),
    ).toBe('active'))
})

describe('opening hours (TC-UNIT-022)', () => {
  // 2026-10-12 is a Monday. 05:30 UTC = 11:00 IST.
  const hours = [
    { dayOfWeek: 1, opensAtMin: 660, closesAtMin: 1380, isClosed: false },
    { dayOfWeek: 2, opensAtMin: 660, closesAtMin: 1380, isClosed: true },
  ]
  it('converts to IST (UTC+05:30)', () => {
    expect(istClock(d('2026-10-12T05:30:00Z'))).toEqual({ dayOfWeek: 1, minutes: 660 })
    // 20:00 UTC Monday is 01:30 IST Tuesday: the day rolls over.
    expect(istClock(d('2026-10-12T20:00:00Z'))).toEqual({ dayOfWeek: 2, minutes: 90 })
  })
  it('is open at the opening minute and closed at the closing minute', () => {
    expect(isOpenNow(hours, d('2026-10-12T05:30:00Z'))).toBe(true)
    expect(isOpenNow(hours, d('2026-10-12T05:29:00Z'))).toBe(false)
    expect(isOpenNow(hours, d('2026-10-12T17:29:00Z'))).toBe(true) // 22:59 IST
    expect(isOpenNow(hours, d('2026-10-12T17:30:00Z'))).toBe(false) // 23:00 IST
  })
  it('is closed on a closed day and on a day with no row', () => {
    expect(isOpenNow(hours, d('2026-10-13T08:00:00Z'))).toBe(false)
    expect(isOpenNow(hours, d('2026-10-14T08:00:00Z'))).toBe(false)
  })
  it('formats minutes as HH:MM and rejects out-of-range values', () => {
    expect(minutesToHHMM(0)).toBe('00:00')
    expect(minutesToHHMM(690)).toBe('11:30')
    expect(minutesToHHMM(1440)).toBe('24:00')
    expect(() => minutesToHHMM(1441)).toThrow(RangeError)
    expect(() => minutesToHHMM(-1)).toThrow(RangeError)
  })
})
