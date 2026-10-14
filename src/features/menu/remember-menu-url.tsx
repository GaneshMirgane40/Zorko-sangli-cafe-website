'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const KEY = 'zorko:last-menu-url'

/** Stores the current /menu URL so item pages can link back with the same filters (UI_SPEC §12.3). */
export function RememberMenuUrl() {
  const pathname = usePathname()
  const search = useSearchParams()
  useEffect(() => {
    const qs = search.toString()
    try {
      sessionStorage.setItem(KEY, qs ? `${pathname}?${qs}` : pathname)
    } catch {
      // Storage can be unavailable (private mode); the plain /menu link still works.
    }
  }, [pathname, search])
  return null
}

/** The last menu URL from this tab, only if it is a safe internal /menu path. */
export function readLastMenuUrl(): string | null {
  try {
    const url = sessionStorage.getItem(KEY)
    return url && /^\/menu(\?[^#]*)?$/.test(url) ? url : null
  } catch {
    return null
  }
}
