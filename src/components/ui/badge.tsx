import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// UI_SPEC §7.4 — every badge is driven by real data/flags, never mockup copy.
const tones = {
  bestSeller: 'bg-primary text-on-primary',
  trending: 'bg-secondary-container text-on-secondary-container',
  offer: 'bg-secondary-container text-on-secondary-container font-extrabold',
  featured: 'bg-surface-container text-on-surface',
  outOfStock: 'bg-inverse-surface/90 text-inverse-on-surface',
  scheduled: 'bg-surface-container-high text-on-surface-variant',
  student: 'bg-secondary-fixed text-on-secondary-fixed',
  demo: 'bg-inverse-surface text-inverse-on-surface',
  neutral: 'bg-surface-container-low text-on-surface-variant',
} as const

export type BadgeTone = keyof typeof tones

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm whitespace-nowrap uppercase',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/** "Available" / "Out of stock" text indicator (never colour alone). */
export function AvailabilityLabel({ available }: { available: boolean }) {
  return available ? (
    <span className="inline-flex items-center gap-1.5 text-label-md text-tertiary">
      <span aria-hidden="true" className="size-2 rounded-full bg-tertiary" />
      Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-label-md text-error">
      <span aria-hidden="true" className="size-2 rounded-full bg-error" />
      Out of stock
    </span>
  )
}
