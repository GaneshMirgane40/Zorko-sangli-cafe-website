import { formatRupees } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Price display (UI_SPEC §3 title-price). With `regularPaise` higher than `paise`, shows the
 * struck-through regular price before the promotional price.
 */
export function Price({
  paise,
  regularPaise,
  className,
}: {
  paise: number
  regularPaise?: number
  className?: string
}) {
  const discounted = regularPaise !== undefined && regularPaise > paise
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      {discounted && (
        <>
          <span className="sr-only">Regular price</span>
          <s className="text-body-sm text-on-surface-variant">{formatRupees(regularPaise)}</s>
          <span className="sr-only">Offer price</span>
        </>
      )}
      <span className="font-title-price text-title-price text-primary">{formatRupees(paise)}</span>
    </span>
  )
}
