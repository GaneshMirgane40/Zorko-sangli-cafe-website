'use client'

import { cn } from '@/lib/utils'

type SwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Accessible name, e.g. "Available: Paneer Wrap". */
  label: string
  disabled?: boolean
  showLabel?: boolean
}

/** On/off switch (admin availability toggles). Uses role="switch" with aria-checked. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  showLabel = false,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={showLabel ? undefined : label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className="inline-flex min-h-12 items-center gap-2 rounded-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-tertiary' : 'bg-outline',
        )}
      >
        <span
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </span>
      {showLabel && <span className="text-label-md text-on-surface">{label}</span>}
    </button>
  )
}
