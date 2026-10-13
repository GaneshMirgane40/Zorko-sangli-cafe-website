import { X } from 'lucide-react'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// UI_SPEC §7.3 category pill: inactive tonal, active primary. Links keep filter state in the URL.
const pillBase =
  'inline-flex min-h-12 lg:min-h-10 shrink-0 snap-start items-center gap-1.5 rounded-full px-space-lg py-2.5 text-label-md whitespace-nowrap transition-colors'
const pillInactive =
  'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
const pillActive = 'bg-primary text-on-primary shadow-sm'

type PillLinkProps = ComponentProps<typeof Link> & { active?: boolean; icon?: ReactNode }

export function PillLink({ active = false, icon, className, children, ...props }: PillLinkProps) {
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={cn(pillBase, active ? pillActive : pillInactive, className)}
      {...props}
    >
      {icon}
      {children}
    </Link>
  )
}

type PillButtonProps = ComponentProps<'button'> & { pressed?: boolean; icon?: ReactNode }

/** Toggle pill for client-side choices (e.g. grid/list); exposes state via aria-pressed. */
export function PillButton({
  pressed = false,
  icon,
  className,
  children,
  type = 'button',
  ...props
}: PillButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cn(pillBase, pressed ? pillActive : pillInactive, className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

/**
 * Active-filter chip (UI_SPEC §7.3). The whole chip is the remove link so the touch target is
 * at least 48px tall on touch layouts.
 */
export function FilterChip({ label, removeHref }: { label: string; removeHref: string }) {
  return (
    <Link
      href={removeHref}
      aria-label={`Remove filter: ${label}`}
      className="inline-flex min-h-12 items-center gap-1.5 rounded-full bg-primary-fixed py-1 pr-2.5 pl-3 text-label-md text-on-primary-fixed transition-colors hover:bg-primary-fixed-dim lg:min-h-9"
    >
      {label}
      <X aria-hidden="true" className="size-3.5" />
    </Link>
  )
}

/** Horizontal snap-scrolling row for pills (edge-to-edge on mobile). */
export function PillRow({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'no-scrollbar flex snap-x snap-mandatory gap-space-xs overflow-x-auto py-1',
        className,
      )}
      {...props}
    />
  )
}
