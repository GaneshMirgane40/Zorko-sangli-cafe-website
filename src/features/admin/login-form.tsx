'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/field'
import { loginAction, type LoginState } from './actions'

/** Admin sign-in form (UI_SPEC §13 login). Works without JavaScript (plain form POST). */
export function LoginForm({ next, notice }: { next: string; notice: string | null }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {
    error: null,
    email: '',
  })
  const message = state.error ?? notice
  return (
    <form action={action} className="flex flex-col gap-space-md">
      <input type="hidden" name="next" value={next} />
      {message && (
        <p
          role={state.error ? 'alert' : 'status'}
          className={
            state.error
              ? 'rounded-xl bg-error-container px-space-md py-space-sm text-body-sm text-on-error-container'
              : 'rounded-xl bg-surface-container-high px-space-md py-space-sm text-body-sm text-on-surface'
          }
        >
          {message}
        </p>
      )}
      <TextField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="username"
        maxLength={254}
        defaultValue={state.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        maxLength={128}
      />
      <Button type="submit" loading={pending} className="w-full">
        Sign in
      </Button>
    </form>
  )
}
