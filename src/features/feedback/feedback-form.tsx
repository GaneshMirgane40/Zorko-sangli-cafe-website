'use client'

import { CheckCircle2, MessageSquare, Send, Sparkles } from 'lucide-react'
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { submitFeedbackAction, type FeedbackFormState } from './actions'

const initialState: FeedbackFormState = {}

const QUICK_TAGS = [
  'Delicious Burgers',
  'Great Ambiance',
  'Quick Service',
  'Super Affordable',
  'Loved the Mojitos',
  'Student Friendly',
]

export function FeedbackForm() {
  const [state, formAction, isPending] = useActionState(submitFeedbackAction, initialState)
  const [message, setMessage] = useState('')
  const [submittedAgain, setSubmittedAgain] = useState(false)

  const handleAddTag = (tag: string) => {
    setMessage((prev) => (prev ? `${prev} · ${tag}` : tag))
  }

  if (state.success && !submittedAgain) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-tertiary-container/30 bg-surface-container-lowest p-space-xl text-center shadow-md">
        <div className="flex size-14 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="max-w-md">
          <h3 className="font-heading text-headline-md text-on-surface">Thank You!</h3>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Your feedback has been received. Our café team values every review and works continuously
            to give you the best experience at ZORKO Sangli.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setSubmittedAgain(true)
            setMessage('')
          }}
          className="mt-2"
        >
          Submit Another Review
        </Button>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-space-md rounded-3xl border border-surface-container-high bg-surface-container-lowest p-space-lg shadow-md md:p-space-xl"
    >
      <div className="flex items-center gap-2 text-primary font-heading text-label-lg uppercase tracking-wider">
        <MessageSquare className="size-4" />
        <span>Share Your Experience</span>
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-error/20 bg-error-container/20 p-space-sm text-body-sm text-error"
        >
          {state.error}
        </div>
      )}

      {/* Name Input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-label-md font-bold text-on-surface">
          Your Name <span className="text-body-sm font-normal text-on-surface-variant">(optional)</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          maxLength={40}
          placeholder="e.g. Utkarsh or leave blank for Anonymous"
          className="h-12 rounded-xl border border-surface-container-high bg-surface px-space-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none"
        />
        {state.fieldErrors?.displayName && (
          <p className="text-body-xs text-error">{state.fieldErrors.displayName[0]}</p>
        )}
      </div>

      {/* Quick Tags */}
      <div className="flex flex-col gap-2">
        <span className="text-label-sm font-bold text-on-surface-variant flex items-center gap-1">
          <Sparkles className="size-3 text-secondary" />
          Quick highlights (tap to add):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className="rounded-full bg-surface-container px-3 py-1 text-label-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Message */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="message" className="text-label-md font-bold text-on-surface">
            Your Thoughts / Review <span className="text-primary">*</span>
          </label>
          <span className="text-body-xs text-on-surface-variant">{message.length}/1000</span>
        </div>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you enjoyed, your favorite dish, or how we can improve..."
          className="rounded-xl border border-surface-container-high bg-surface p-space-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none resize-y"
        />
        {state.fieldErrors?.message && (
          <p className="text-body-xs text-error">{state.fieldErrors.message[0]}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || message.trim().length < 5}
        className="gap-2 mt-2 self-start"
      >
        <Send className="size-4" />
        {isPending ? 'Sending...' : 'Send Feedback'}
      </Button>
    </form>
  )
}

