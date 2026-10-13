import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type PaginationProps = {
  page: number
  totalPages: number
  /** Path without query, e.g. "/menu". */
  basePath: string
  /** Current query params; `page` is replaced per link so filters are preserved. */
  query?: Record<string, string | undefined>
}

export function pageHref(
  basePath: string,
  query: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '' && key !== 'page') params.set(key, value)
  }
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

/** Page numbers shown: first, last, current ±1, with gaps marked by an ellipsis. */
export function visiblePages(page: number, totalPages: number): Array<number | 'gap'> {
  const wanted = new Set(
    [1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages),
  )
  const sorted = [...wanted].sort((a, b) => a - b)
  const result: Array<number | 'gap'> = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('gap')
    result.push(p)
  })
  return result
}

const item =
  'inline-flex size-12 items-center justify-center rounded-full text-label-lg transition-colors'

/** Server-rendered pagination with plain links (works without JS) — UI_SPEC §7.7. */
export function Pagination({ page, totalPages, basePath, query = {} }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link
          href={pageHref(basePath, query, page - 1)}
          className={cn(item, 'hover:bg-surface-container')}
          aria-label="Previous page"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </Link>
      ) : (
        <span className={cn(item, 'text-outline-variant')} aria-hidden="true">
          <ChevronLeft className="size-5" />
        </span>
      )}
      {visiblePages(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-on-surface-variant" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(basePath, query, p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={cn(
              item,
              p === page
                ? 'bg-primary text-on-primary'
                : 'text-on-surface hover:bg-surface-container',
            )}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          href={pageHref(basePath, query, page + 1)}
          className={cn(item, 'hover:bg-surface-container')}
          aria-label="Next page"
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </Link>
      ) : (
        <span className={cn(item, 'text-outline-variant')} aria-hidden="true">
          <ChevronRight className="size-5" />
        </span>
      )}
    </nav>
  )
}
