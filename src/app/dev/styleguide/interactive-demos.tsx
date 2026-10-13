'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog, Dialog } from '@/components/ui/dialog'
import { ErrorState } from '@/components/ui/states'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'

/** Client-side demos for the style guide (dialogs, toasts, switch, retry). */
export function InteractiveDemos() {
  const toast = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [available, setAvailable] = useState(true)
  const [retries, setRetries] = useState(0)

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-wrap items-center gap-space-sm">
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          Open dialog
        </Button>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Archive item…
        </Button>
        <Button variant="secondary" onClick={() => toast.show('Changes saved')}>
          Show success toast
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.show('Could not save. Please try again.', 'error')}
        >
          Show error toast
        </Button>
      </div>

      <div className="flex items-center gap-space-md">
        <Switch
          checked={available}
          onCheckedChange={setAvailable}
          label="Available: demo item"
          showLabel
        />
        <span className="text-body-sm text-on-surface-variant" aria-live="polite">
          Currently {available ? 'available' : 'out of stock'}
        </span>
      </div>

      <Card>
        <ErrorState
          title="Couldn't load the menu"
          description={`Demo error state. Retry pressed ${retries} time${retries === 1 ? '' : 's'}.`}
          onRetry={() => setRetries((n) => n + 1)}
        />
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Dialog title"
        description="Focus stays inside while open; Esc or the close button returns focus to the opener."
        footer={<Button onClick={() => setDialogOpen(false)}>Done</Button>}
      />
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          toast.show('Demo item archived (nothing was changed — style guide only)')
        }}
        title="Archive “Demo item”?"
        description="It will be hidden from the public menu. You can restore it later."
        confirmLabel="Archive"
        destructive
      />
    </div>
  )
}
