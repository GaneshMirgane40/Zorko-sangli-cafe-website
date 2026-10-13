import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Level-1 card (UI_SPEC §6, §7.6): white, rounded-2xl, soft shadow, deeper on hover when interactive. */
export function Card({
  className,
  interactive = false,
  ...props
}: ComponentProps<'div'> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-container-lowest p-space-md shadow-sm',
        interactive && 'transition-shadow hover:shadow-md',
        className,
      )}
      {...props}
    />
  )
}
