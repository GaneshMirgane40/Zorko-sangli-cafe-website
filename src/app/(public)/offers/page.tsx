import { ArrowDown, GraduationCap, Layers, Sparkles, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { buttonClasses } from '@/components/ui/button'
import { PillLink, PillRow } from '@/components/ui/chip'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/states'
import { shortAddress } from '@/components/layout/site-header'
import { InfoOfferCard, OfferCard, ScheduledOfferCard } from '@/features/offers/offer-cards'
import { cachedCafe, cachedOffers } from '@/server/public-data'
import type { OffersQuery } from '@/lib/validation/public'

export const metadata: Metadata = {
  title: 'Offers & Combos',
  description: 'Current combos, item deals and Student Zone offers at ZORKO Sangli.',
  alternates: { canonical: '/offers' },
}

/** Tabs (UI_SPEC §12.4): kept in the URL so they work without JavaScript and can be shared. */
const TABS = [
  { key: 'all', label: 'All', icon: Sparkles, query: {} },
  { key: 'combos', label: 'Combos', icon: Layers, query: { kind: 'combo' } },
  { key: 'deals', label: 'Item deals', icon: Tag, query: { kind: 'discount' } },
  { key: 'student', label: 'Student', icon: GraduationCap, query: { student: '1' } },
] as const satisfies readonly { key: string; label: string; icon: unknown; query: OffersQuery }[]
type TabKey = (typeof TABS)[number]['key']

export default function OffersPage({ searchParams }: PageProps<'/offers'>) {
  return (
    <main id="main" className="flex-1">
      <Suspense fallback={<OffersSkeleton />}>
        <OffersContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

function OffersSkeleton() {
  return (
    <Container className="flex flex-col gap-space-lg py-space-xl" aria-busy="true">
      <span className="sr-only" role="status">
        Loading offers…
      </span>
      <Skeleton className="h-40 rounded-3xl" />
      <div className="grid gap-space-lg lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </Container>
  )
}

async function OffersContent({ searchParams }: Pick<PageProps<'/offers'>, 'searchParams'>) {
  const raw = (await searchParams).tab
  const tab: TabKey = TABS.some((t) => t.key === raw) ? (raw as TabKey) : 'all'
  const current = TABS.find((t) => t.key === tab)!
  const [{ active, scheduled }, allOffers, cafe] = await Promise.all([
    cachedOffers(current.query),
    cachedOffers(),
    cachedCafe(),
  ])
  const pureVeg = cafe?.isPureVegConfirmed ?? false
  const combos = active.filter((o) => o.kind === 'COMBO')
  const deals = active.filter((o) => o.kind === 'DISCOUNT')
  const specials = active.filter((o) => o.kind === 'INFO')
  const nothing = active.length === 0 && scheduled.length === 0

  return (
    <>
      {/* ---------------- hero (Stitch: eyebrow, H1, lead, summary card; coupon/voucher removed) */}
      <section className="relative overflow-hidden bg-surface-container-low py-space-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-primary-container/10 blur-3xl"
        />
        <Container className="relative grid items-center gap-space-lg lg:grid-cols-12">
          <div className="flex flex-col items-start gap-space-md lg:col-span-8">
            {cafe && (
              <p className="rounded-full bg-surface-container-high px-space-md py-1 text-label-md text-on-surface-variant">
                {shortAddress(cafe)}
              </p>
            )}
            <h1 className="text-display-hero-mobile md:text-display-hero">
              Offers &amp; Combo Feasts at <span className="text-primary">ZORKO Sangli</span>
            </h1>
            <p className="max-w-xl text-body-lg text-on-surface-variant">
              Current combos and deals from the café. Offers apply at the counter; prices are shown
              as set by the café.
            </p>
          </div>
          <div className="flex flex-col gap-space-sm rounded-3xl bg-surface-container-lowest p-space-lg shadow-lg lg:col-span-4">
            <p className="text-label-sm tracking-wider text-primary uppercase">Right now</p>
            <p className="font-heading text-headline-md">
              {allOffers.active.length} active {allOffers.active.length === 1 ? 'offer' : 'offers'}
            </p>
            {allOffers.scheduled.length > 0 && (
              <p className="text-body-sm text-on-surface-variant">
                {allOffers.scheduled.length} coming soon
              </p>
            )}
            {combos.length > 0 && (
              <a href="#combos" className={buttonClasses({ className: 'mt-space-xs' })}>
                Jump to combos <ArrowDown aria-hidden="true" className="size-4" />
              </a>
            )}
          </div>
        </Container>
      </section>

      {/* ---------------- tabs */}
      <nav
        aria-label="Offer types"
        className="sticky top-16 z-30 border-b border-surface-container bg-surface/95 backdrop-blur md:top-[116px]"
      >
        <Container>
          <PillRow className="py-space-sm">
            {TABS.map((t) => (
              <PillLink
                key={t.key}
                href={t.key === 'all' ? '/offers' : `/offers?tab=${t.key}`}
                active={t.key === tab}
                scroll={false}
                icon={<t.icon aria-hidden="true" className="size-4" />}
              >
                {t.label}
              </PillLink>
            ))}
          </PillRow>
        </Container>
      </nav>

      {nothing ? (
        <Container className="py-space-2xl">
          <EmptyState
            icon={<Tag aria-hidden="true" className="size-6" />}
            title={
              tab === 'all' ? 'No active offers right now' : 'No offers in this group right now'
            }
            description="Check back soon — new combos and deals appear here as soon as the café publishes them."
            action={
              <Link href="/menu" className={buttonClasses({})}>
                Browse the menu
              </Link>
            }
          />
        </Container>
      ) : (
        <>
          {combos.length > 0 && (
            <section id="combos" className="scroll-mt-40 py-space-xl">
              <Container>
                <SectionHeading eyebrow="Combos" title="Featured Combo Feasts" />
                <div className="grid gap-space-lg lg:grid-cols-2">
                  {combos.map((o) => (
                    <OfferCard key={o.slug} offer={o} pureVeg={pureVeg} />
                  ))}
                </div>
              </Container>
            </section>
          )}
          {deals.length > 0 && (
            <section className="py-space-xl">
              <Container>
                <SectionHeading eyebrow="Item deals" title="Deals on Favourites" />
                <div className="grid gap-space-lg lg:grid-cols-2">
                  {deals.map((o) => (
                    <OfferCard key={o.slug} offer={o} pureVeg={pureVeg} />
                  ))}
                </div>
              </Container>
            </section>
          )}
          {specials.length > 0 && (
            <section className="bg-surface-container-low py-space-xl">
              <Container>
                <SectionHeading eyebrow="Specials" title="Limited-Time Specials" />
                <div className="grid gap-space-lg md:grid-cols-2">
                  {specials.map((o) => (
                    <InfoOfferCard key={o.slug} offer={o} />
                  ))}
                </div>
              </Container>
            </section>
          )}
          {scheduled.length > 0 && (
            <section className="py-space-xl">
              <Container>
                <SectionHeading eyebrow="Coming soon" title="Starting Soon" />
                <div className="grid gap-space-md md:grid-cols-2 lg:grid-cols-3">
                  {scheduled.map((o) => (
                    <ScheduledOfferCard key={o.slug} offer={o} />
                  ))}
                </div>
              </Container>
            </section>
          )}
          {active.length === 0 && (
            <Container className="pb-space-xl">
              <p className="text-body-md text-on-surface-variant">
                No active offers in this group right now.
              </p>
            </Container>
          )}
        </>
      )}

      {cafe?.offerTerms && (
        <section className="py-space-xl">
          <Container>
            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
              <h2 className="text-headline-sm">Terms</h2>
              <p className="mt-space-xs text-body-sm whitespace-pre-line text-on-surface-variant">
                {cafe.offerTerms}
              </p>
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
