import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// UI_SPEC §7.2. Placeholders use on-surface-variant (outline fails contrast on #F7F8FA).
const controlBase =
  'w-full rounded-xl border border-[rgba(26,26,26,0.12)] bg-surface-canvas-subtle px-space-md text-body-md text-on-surface placeholder:text-on-surface-variant transition focus:bg-white focus:outline-none focus-visible:ring-[1.5px] focus-visible:ring-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-error'

type FieldShellProps = {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  /** Extra content on the label row, e.g. a character counter. */
  aside?: ReactNode
}

function FieldShell({ id, label, hint, error, required, children, aside }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-label-md text-on-surface">
          {label}
          {required && (
            <span className="text-error" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        {aside}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-body-sm text-on-surface-variant">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}

function describedBy(id: string, hint?: string, error?: string) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

type CommonProps = { label: string; hint?: string; error?: string; aside?: ReactNode }

export function TextField({
  label,
  hint,
  error,
  aside,
  id,
  className,
  required,
  ...props
}: CommonProps & ComponentProps<'input'>) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      aside={aside}
    >
      <input
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(controlBase, 'h-12', className)}
        {...props}
      />
    </FieldShell>
  )
}

export function TextArea({
  label,
  hint,
  error,
  aside,
  id,
  className,
  required,
  ...props
}: CommonProps & ComponentProps<'textarea'>) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      aside={aside}
    >
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(controlBase, 'min-h-32 py-3', className)}
        {...props}
      />
    </FieldShell>
  )
}

export function Select({
  label,
  hint,
  error,
  aside,
  id,
  className,
  required,
  children,
  ...props
}: CommonProps & ComponentProps<'select'>) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      aside={aside}
    >
      <select
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(controlBase, 'h-12 cursor-pointer font-bold', className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  )
}

type ChoiceProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: ReactNode
  description?: ReactNode
}

/** Full-row checkbox (UI_SPEC §7.2): the whole row is the click target, ≥48px tall. */
export function Checkbox({ label, description, className, ...props }: ChoiceProps) {
  return (
    <label
      className={cn(
        'flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg p-2 hover:bg-surface-container-low has-disabled:cursor-not-allowed has-disabled:opacity-60',
        className,
      )}
    >
      <span className="flex flex-col">
        <span className="text-body-md text-on-surface">{label}</span>
        {description && <span className="text-body-sm text-on-surface-variant">{description}</span>}
      </span>
      <input type="checkbox" className="size-5 shrink-0 cursor-pointer accent-primary" {...props} />
    </label>
  )
}

/** Full-row radio; group several inside a <fieldset> with a <legend>. */
export function Radio({ label, description, className, ...props }: ChoiceProps) {
  return (
    <label
      className={cn(
        'flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg p-2 hover:bg-surface-container-low has-checked:bg-surface-container-low has-disabled:cursor-not-allowed has-disabled:opacity-60',
        className,
      )}
    >
      <span className="flex flex-col">
        <span className="text-body-md text-on-surface">{label}</span>
        {description && <span className="text-body-sm text-on-surface-variant">{description}</span>}
      </span>
      <input type="radio" className="size-5 shrink-0 cursor-pointer accent-primary" {...props} />
    </label>
  )
}
