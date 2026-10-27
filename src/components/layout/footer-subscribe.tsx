'use client'

import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

export function FooterSubscribe() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setStatus('success')
    setEmail('')
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <div className="flex flex-col gap-2 pt-2">
      <h3 className="font-heading text-body-md font-bold tracking-tight text-white">
        Subscribe
      </h3>
      <p className="text-label-sm text-[#a39e9c]">
        Get exclusive discounts &amp; seasonal menu updates.
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-2 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 px-3.5 py-2.5 text-label-sm font-semibold text-[#22c55e]">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Thanks for subscribing to ZORKO updates!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="w-full rounded-xl bg-white px-3.5 py-2 text-body-sm text-[#1b1a19] placeholder:text-[#8e8987] focus:outline-none focus:ring-2 focus:ring-[#f18825]"
            aria-label="Email address for subscription"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#f18825] px-4 py-2 text-label-sm font-bold text-white shadow-sm transition-all hover:bg-[#d1430a] active:scale-95"
          >
            <span>Subscribe</span>
            <Send className="size-3.5" />
          </button>
        </form>
      )}
    </div>
  )
}

