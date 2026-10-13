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
