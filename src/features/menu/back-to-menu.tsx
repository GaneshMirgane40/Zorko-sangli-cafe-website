'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { buttonClasses } from '@/components/ui/button'
import { readLastMenuUrl } from './remember-menu-url'

/** "Back to menu" pill that restores the filters the visitor came from. */
export function BackToMenu() {
  const [href, setHref] = useState('/menu')
  useEffect(() => {
    const last = readLastMenuUrl()
    // Reading sessionStorage is only possible after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (last) setHref(last)
  }, [])
  return (
    <Link href={href} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
      <ArrowLeft aria-hidden="true" className="size-4" />
      Back to menu
    </Link>
  )
}
