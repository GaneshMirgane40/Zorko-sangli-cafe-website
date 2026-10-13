'use client'

import { CircleAlert, CircleCheck, X } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type ToastTone = 'success' | 'error'
type Toast = { id: number; tone: ToastTone; message: string }
type ToastApi = { show: (message: string, tone?: ToastTone) => void }

const ToastContext = createContext<ToastApi | null>(null)

const AUTO_DISMISS_MS = 5000

/**
 * Toast notifications (UI_SPEC §7.7). Success uses role="status", errors role="alert".
 * Auto-dismiss pauses while the toast is hovered or focused.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback(
    (id: number) => setToasts((all) => all.filter((t) => t.id !== id)),
    [],
  )
  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = nextId.current++
    setToasts((all) => [...all.slice(-2), { id, tone, message }]) // keep at most 3
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-center gap-2 md:bottom-6">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [paused, onDismiss])

  const Icon = toast.tone === 'success' ? CircleCheck : CircleAlert
  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-full bg-inverse-surface py-1 pr-1 pl-4 text-body-md text-inverse-on-surface shadow-2xl"
    >
      <Icon
        aria-hidden="true"
        className={
          toast.tone === 'success'
            ? 'size-5 text-tertiary-fixed-dim'
            : 'size-5 text-primary-fixed-dim'
        }
      />
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="inline-flex size-12 items-center justify-center rounded-full hover:bg-inverse-on-surface/10"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used inside <ToastProvider>')
  return api
}
