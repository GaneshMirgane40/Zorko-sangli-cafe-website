'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { isActivePath, type NavItem } from '@/lib/site/nav'
import { cn } from '@/lib/utils'

/** Desktop nav pills (UI_SPEC §7.3 nav pill, §8.1). Shown at ≥1280 px. */
export function NavLinks({ items }: { items: NavItem[] }) {
  // usePathname must sit inside Suspense so routes can still be prerendered (Cache Components).
  return (
    <Suspense fallback={<NavLinksView items={items} pathname="" />}>
      <NavLinksLive items={items} />
    </Suspense>
  )
}

function NavLinksLive({ items }: { items: NavItem[] }) {
  return <NavLinksView items={items} pathname={usePathname()} />
}

function NavLinksView({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav aria-label="Main" className="hidden xl:block">
      <ul className="flex items-center gap-1 rounded-full bg-surface-container-low p-1">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-10 items-center rounded-full px-space-md text-label-lg whitespace-nowrap transition-colors',
                  active
                    ? 'bg-primary-container font-bold text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
