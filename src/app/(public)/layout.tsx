import { connection } from 'next/server'
import { Suspense } from 'react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DemoRibbon } from '@/components/layout/demo-ribbon'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { liveMore, liveNav } from '@/lib/site/nav'
import { cachedCafe } from '@/server/public-data'

/** Café info for the chrome; null if the database is unreachable (navigation must still work). */
async function safeCafe() {
  await connection() // request time only: never query the database during `next build`
  try {
    return await cachedCafe()
  } catch {
    return null
  }
}

async function Header() {
  const cafe = await safeCafe()
  return (
    <>
      <SiteHeader cafe={cafe} />
      {cafe?.isDemo && <DemoRibbon />}
    </>
  )
}

async function Footer() {
  return <SiteFooter cafe={await safeCafe()} />
}

/** Public site chrome (UI_SPEC §8): header, page, footer, mobile bottom nav. */
export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-primary px-space-md py-2 text-label-lg text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Suspense fallback={<SiteHeader cafe={null} />}>
        <Header />
      </Suspense>
      <div className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <BottomNav items={liveNav()} more={liveMore()} />
    </>
  )
}
