'use client'

import { LayoutDashboard, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useState, type ReactNode } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { isActiveAdminPath } from '@/lib/site/admin-nav'
import type { NavItem } from '@/lib/site/nav'
import { cn } from '@/lib/utils'

function Links({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <Suspense fallback={<LinksView items={items} pathname="" />}>
      <LinksLive items={items} onNavigate={onNavigate} />
    </Suspense>
  )
}

function LinksLive(props: { items: NavItem[]; onNavigate?: () => void }) {
  return <LinksView {...props} pathname={usePathname()} />
}

function LinksView({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActiveAdminPath(pathname, item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-12 items-center gap-2 rounded-xl px-space-md text-label-lg lg:min-h-10',
                active
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container',
              )}
            >
              {item.href === '/admin' && <LayoutDashboard aria-hidden="true" className="size-4" />}
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** Sidebar (≥1024 px) and top-bar drawer (<1024 px), UI_SPEC §8.4. */
export function AdminNav({ items, footer }: { items: NavItem[]; footer: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-space-lg bg-surface-container-low p-space-md lg:flex">
        <p className="px-space-md pt-space-sm font-heading text-headline-sm">
          ZORKO <span className="text-primary">Admin</span>
        </p>
        <nav aria-label="Admin" className="flex-1">
          <Links items={items} />
        </nav>
        {footer}
      </aside>
      <div className="sticky top-0 z-30 flex items-center justify-between gap-space-sm border-b border-surface-container bg-surface/95 px-space-md py-space-sm backdrop-blur lg:hidden">
        <p className="font-heading text-headline-sm">
          ZORKO <span className="text-primary">Admin</span>
        </p>
        <button
          type="button"
          aria-label="Open admin menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="inline-flex size-12 items-center justify-center rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Admin menu" placement="sheet">
        <nav aria-label="Admin" className="flex flex-col gap-space-lg">
          <Links items={items} onNavigate={() => setOpen(false)} />
          {footer}
        </nav>
      </Dialog>
    </>
  )
}
