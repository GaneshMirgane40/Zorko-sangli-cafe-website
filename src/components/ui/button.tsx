import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

// UI_SPEC §7.1 — classes from design/stitch code.html; primary hover per ADR-004.
const base =
  'inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition motion-safe:active:scale-95 disabled:pointer-events-none aria-disabled:pointer-events-none'

const variants = {
  primary: 'bg-primary text-on-primary shadow-lg shadow-primary/25 hover:bg-primary-container',
  secondary: 'bg-surface-container text-primary hover:bg-surface-container-high',
  ghost: 'bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary',
  inverse: 'bg-surface-container-lowest text-primary shadow-md hover:bg-surface-container-low',
  whatsapp: 'bg-veg-pure-green text-on-tertiary hover:opacity-90',
  destructive: 'bg-error text-on-error hover:opacity-90',
} as const

const sizes = {
  // min-h-12 = 48px touch target (UI_SPEC §11)
  md: 'min-h-12 px-space-xl py-3 text-label-lg',
  sm: 'min-h-12 lg:min-h-10 px-space-md py-2 text-label-md',
} as const

const disabledStyle =
  'bg-surface-container text-on-surface-variant shadow-none cursor-not-allowed hover:bg-surface-container'

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; className?: string }

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
}: StyleProps & { disabled?: boolean }) {
  return cn(base, sizes[size], disabled ? disabledStyle : variants[variant], className)
}

type ButtonProps = ComponentProps<'button'> &
  StyleProps & {
    loading?: boolean
    icon?: ReactNode
  }

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading)
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, disabled: isDisabled, className })}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  )
}

type LinkButtonProps = ComponentProps<typeof Link> &
  StyleProps & { icon?: ReactNode; iconEnd?: ReactNode }

/** A link styled as a button. Use for navigation; use <Button> for actions. */
export function LinkButton({
  variant,
  size,
  icon,
  iconEnd,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {icon}
      {children}
      {iconEnd}
    </Link>
  )
}

type IconButtonProps = ComponentProps<'button'> & {
  /** Required: icon-only buttons need an accessible name. */
  label: string
  icon: ReactNode
}

export function IconButton({ label, icon, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
