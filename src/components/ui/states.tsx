import { CircleAlert, SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

/** Empty state (UI_SPEC §7.7): icon tile, title, text and one action. */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-space-sm px-space-md py-space-2xl text-center',
        className,
      )}
    >
      <div className="mb-space-xs flex size-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
        {icon ?? <SearchX aria-hidden="true" className="size-6" />}
      </div>
      <h2 className="text-headline-sm text-on-surface">{title}</h2>
      {description && (
        <p className="max-w-md text-body-md text-on-surface-variant">{description}</p>
      )}
      {action && <div className="mt-space-sm">{action}</div>}
    </div>
  )
}

/** Error state with retry. Shows only a safe message plus an optional support reference. */
export function ErrorState({
  title,
  description,
  onRetry,
  reference,
  className,
}: {
  title: string
  description?: ReactNode
  onRetry?: () => void
  reference?: string
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-space-sm px-space-md py-space-2xl text-center',
        className,
      )}
    >
      <div className="mb-space-xs flex size-12 items-center justify-center rounded-2xl bg-error-container text-on-error-container">
        <CircleAlert aria-hidden="true" className="size-6" />
      </div>
      <h2 className="text-headline-sm text-on-surface">{title}</h2>
      {description && (
        <p className="max-w-md text-body-md text-on-surface-variant">{description}</p>
      )}
      {onRetry && (
        <Button className="mt-space-sm" onClick={onRetry}>
          Try again
        </Button>
      )}
      {reference && <p className="text-body-sm text-on-surface-variant">Reference: {reference}</p>}
    </div>
  )
}
