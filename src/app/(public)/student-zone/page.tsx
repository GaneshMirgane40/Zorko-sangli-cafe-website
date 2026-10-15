import { GraduationCap, Info } from 'lucide-react'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/site/seo'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { buttonClasses } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/states'
import { InfoOfferCard, OfferCard, ScheduledOfferCard } from '@/features/offers/offer-cards'
import { cachedCafe, cachedOffers } from '@/server/public-data'

export const metadata: Metadata = pageMetadata({
  title: 'Student Zone',
  description: 'Student offers and combos at ZORKO Sangli.',
  path: '/student-zone',
})

/** Shown on the page and tested: the site never checks student status (CLAUDE.md §3.1 D). */
export const STUDENT_DISCLAIMER =
  'Offer terms are set by the café; this website does not verify student status.'

/** Student Zone (UI_SPEC §12.6, derived screen): information only, no student-ID check. */
export default function StudentZonePage() {
  return (
    <main id="main" className="flex-1">
      <Suspense fallback={<StudentSkeleton />}>
        <StudentContent />
      </Suspense>
    </main>
  )
}

function StudentSkeleton() {
  return (
    <Container className="flex flex-col gap-space-lg py-space-xl" aria-busy="true">
      <span className="sr-only" role="status">
        Loading Student Zone…
      </span>
      <Skeleton className="h-48 rounded-3xl" />
      <div className="grid gap-space-lg lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </Container>
  )
}

async function StudentContent() {
  await connection() // request time only: never query the database during `next build`
  const [{ active, scheduled }, cafe] = await Promise.all([
    cachedOffers({ student: '1' }),
    cachedCafe(),
  ])
  const pureVeg = cafe?.isPureVegConfirmed ?? false

  return (
    <>
      <section className="py-space-xl">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-high p-space-lg md:p-space-xl">
            <GraduationCap
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-secondary-container/40"
            />
            <div className="relative flex max-w-2xl flex-col items-start gap-space-md">
              <p className="text-label-sm tracking-wider text-primary uppercase">Student Zone</p>
              <h1 className="text-display-hero-mobile md:text-display-hero">
                Student Offers at <span className="text-primary">ZORKO Sangli</span>
              </h1>
              {cafe?.studentZoneText && (
                <p className="text-body-lg whitespace-pre-line text-on-surface-variant">
                  {cafe.studentZoneText}
                </p>
              )}
              <p className="flex items-start gap-space-xs rounded-xl bg-surface-container-lowest px-space-md py-space-sm text-body-sm text-on-surface-variant">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                {STUDENT_DISCLAIMER}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {active.length === 0 && scheduled.length === 0 ? (
        <Container className="pb-space-2xl">
          <EmptyState
            icon={<GraduationCap aria-hidden="true" className="size-6" />}
            title="No student offers right now"
            description="Check back soon — student offers appear here as soon as the café publishes them."
            action={
              <Link href="/offers" className={buttonClasses({})}>
                See all offers
              </Link>
            }
          />
        </Container>
      ) : (
        <>
          {active.length > 0 && (
            <section className="pb-space-xl">
              <Container>
                <SectionHeading eyebrow="For students" title="Current Student Offers" />
                <div className="grid gap-space-lg lg:grid-cols-2">
                  {active.map((o) =>
                    o.kind === 'INFO' ? (
                      <InfoOfferCard key={o.slug} offer={o} />
                    ) : (
                      <OfferCard key={o.slug} offer={o} pureVeg={pureVeg} />
                    ),
                  )}
                </div>
              </Container>
            </section>
          )}
          {scheduled.length > 0 && (
            <section className="pb-space-xl">
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
        </>
      )}

      <section className="bg-surface-container-low py-space-xl">
        <Container className="flex flex-col items-start gap-space-md md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-headline-sm">Hungry for more?</h2>
            <p className="text-body-md text-on-surface-variant">
              Browse the full menu or see every current offer.
            </p>
          </div>
          <div className="flex flex-wrap gap-space-sm">
            <Link href="/menu" className={buttonClasses({})}>
              Browse the menu
            </Link>
            <Link href="/offers" className={buttonClasses({ variant: 'secondary' })}>
              All offers
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}
