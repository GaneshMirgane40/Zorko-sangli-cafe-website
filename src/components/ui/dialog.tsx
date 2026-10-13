'use client'

import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Modal dialog on the native <dialog> element (UI_SPEC §7.7). showModal() makes the rest of the
 * page inert (focus trap), Esc closes it, and browsers return focus to the opener on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  // Element focused when the dialog opened; focus returns there on close in every browser.
  const returnFocusTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      const active = document.activeElement
      returnFocusTo.current =
        active instanceof HTMLElement && active !== document.body ? active : null
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
    if (!open && returnFocusTo.current?.isConnected) {
      returnFocusTo.current.focus()
      returnFocusTo.current = null
    }
  }, [open])

  // Native modal dialogs let Tab escape to the browser UI; wrap focus inside instead (WAI-ARIA).
  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab' || !ref.current) return
    const focusable = ref.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      onClose={onClose}
      // Clicking the backdrop (the dialog element itself, outside the panel) closes it.
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-surface p-0 text-on-surface shadow-2xl backdrop:bg-transparent',
        className,
      )}
    >
      <div className="relative flex flex-col gap-space-md p-space-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-2 right-2 inline-flex size-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        <div className="flex flex-col gap-1 pr-10">
          <h2 id={titleId} className="text-headline-md">
            {title}
          </h2>
          {description && <div className="text-body-md text-on-surface-variant">{description}</div>}
        </div>
        {children}
        {footer && (
          <div className="flex flex-col-reverse gap-space-sm sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  )
}

type ConfirmDialogProps = {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmLabel: string
  destructive?: boolean
  pending?: boolean
}

/** Confirmation for destructive actions; repeats the item name in `description`. */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel,
  destructive = false,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={pending}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
