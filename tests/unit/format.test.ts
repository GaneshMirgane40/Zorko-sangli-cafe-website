import { describe, expect, it } from 'vitest'
import { formatRupees } from '@/lib/format'

describe('formatRupees (TC-UNIT-001)', () => {
  it('formats whole rupees with the symbol flush to the number', () => {
    expect(formatRupees(14900)).toBe('₹149')
  })
  it('shows two decimals only when paise are present', () => {
    expect(formatRupees(14950)).toBe('₹149.50')
    expect(formatRupees(14905)).toBe('₹149.05')
  })
  it('uses Indian digit grouping', () => {
    expect(formatRupees(12_500_00)).toBe('₹12,500')
    expect(formatRupees(1_00_000_00)).toBe('₹1,00,000')
  })
  it('handles zero', () => {
    expect(formatRupees(0)).toBe('₹0')
  })
  it('rejects non-integer paise (money must never be a float)', () => {
    expect(() => formatRupees(149.5)).toThrow(TypeError)
  })
})
