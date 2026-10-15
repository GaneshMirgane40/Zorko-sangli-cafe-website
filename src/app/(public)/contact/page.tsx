import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/site/seo'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense, type ReactNode } from 'react'
import { buttonClasses } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/states'
import { DAY_NAMES, hoursLabel } from '@/features/cafe/hours'
import { MapEmbed } from '@/features/cafe/map-embed'
import { ReviewList } from '@/features/cafe/review-list'
import { formatPhone, istClock } from '@/lib/format'
import { isLive } from '@/lib/site/nav'
import { cn } from '@/lib/utils'
import { cachedCafe, cachedHomeExtras } from '@/server/public-data'
import type { CafeDto } from '@/server/services/cafe'

export const metadata: Metadata = pageMetadata({
  title: 'About & Contact',
  description: 'Address, opening hours, phone and directions for ZORKO Sangli.',
  path: '/contact',
})

/** About & Contact (UI_SPEC §12.8, derived from the home "Visit" section). */
export default function ContactPage() {
  return (
    <main id="main" className="flex-1">
      <div className="bg-surface-warm-cream">
        <Container className="flex flex-col gap-1 py-space-lg">
          <h1 className="text-headline-lg-mobile md:text-headline-lg">About &amp; Contact</h1>
          <p className="text-body-md text-on-surface-variant">
            Where to find us, when we&apos;re open and how to reach the café.
          </p>
        </Container>
      </div>
      <Suspense fallback={<ContactSkeleton />}>
        <ContactContent />
      </Suspense>
    </main>
  )
}

function ContactSkeleton() {
  return (
    <Container className="grid gap-space-lg py-space-xl lg:grid-cols-2" aria-busy="true">
      <span className="sr-only" role="status">
        Loading café details…
      </span>
      <Skeleton className="h-80 rounded-3xl" />
      <Skeleton className="h-80 rounded-3xl" />
    </Container>
  )
}

/** Shown next to values the café has not confirmed yet (CLAUDE.md rule 12). */
function ToBeConfirmed() {
  return (
    <span className="ml-1 rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
      To be confirmed
    </span>
  )
}

function ExternalButton({
  href,
  variant,
  children,
}: {
  href: string
  variant?: 'primary' | 'secondary' | 'whatsapp'
  children: ReactNode
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant })}>
      {children}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

async function ContactContent() {
  await connection() // request time: today's row in the hours table depends on the current day
  const [cafe, extras] = await Promise.all([cachedCafe(), cachedHomeExtras()])
  if (!cafe) {
    return (
      <Container className="py-space-2xl">
        <EmptyState
          title="Café details aren't available yet"
          description="Please check back soon."
          action={
            <Link href="/menu" className={buttonClasses({})}>
              Browse the menu
            </Link>
          }
        />
      </Container>
    )
  }
  const today = istClock().dayOfWeek

  return (
    <>
      <section className="py-space-xl">
        <Container
          className={cn('grid gap-space-lg', cafe.mapQuery && 'lg:grid-cols-2 lg:items-stretch')}
        >
          <div className="flex flex-col gap-space-md rounded-3xl bg-surface-container-low p-space-lg md:p-space-xl">
            <h2 className="text-headline-md">Visit {cafe.name}</h2>
            <address className="flex gap-2 text-body-md not-italic">
              <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                {cafe.verified.address ? (
                  <>
                    {cafe.addressLine}, {cafe.city}
                    {cafe.postalCode && ` ${cafe.postalCode}`}
                  </>
                ) : (
                  <>
                    {cafe.city}
                    <ToBeConfirmed />
                  </>
                )}
              </span>
            </address>
            <ContactLinks cafe={cafe} />
            <div className="flex flex-wrap gap-space-sm">
              {cafe.directionsUrl && (
                <ExternalButton href={cafe.directionsUrl}>
                  <Navigation aria-hidden="true" className="size-4" /> Get directions
                </ExternalButton>
              )}
              {cafe.whatsappUrl && (
                <ExternalButton href={cafe.whatsappUrl} variant="whatsapp">
                  <MessageCircle aria-hidden="true" className="size-4" /> Chat on WhatsApp
                </ExternalButton>
              )}
            </div>
          </div>
          {cafe.mapQuery && <MapEmbed query={cafe.mapQuery} title={`Map of ${cafe.name}`} />}
        </Container>
      </section>

      <section className="pb-space-xl">
        <Container className="grid gap-space-lg lg:grid-cols-2">
          <div className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm md:p-space-xl">
            <h2 className="flex items-center gap-2 text-headline-sm">
              <Clock aria-hidden="true" className="size-5 text-primary" /> Opening hours
              {!cafe.verified.hours && <ToBeConfirmed />}
            </h2>
            {cafe.hours.length === 0 ? (
              <p className="mt-space-sm text-body-md text-on-surface-variant">
                Opening hours will be added soon.
              </p>
            ) : (
              // data-volatile: the "today" row changes daily, so visual baselines mask the table.
              <table data-volatile className="mt-space-md w-full text-body-md">
                <caption className="sr-only">Opening hours for each day of the week</caption>
                <tbody>
                  {cafe.hours.map((d) => {
                    const isToday = d.dayOfWeek === today
                    return (
                      <tr
                        key={d.dayOfWeek}
                        aria-current={isToday ? 'date' : undefined}
                        className={cn(
                          'border-b border-surface-container last:border-0',
                          isToday && 'font-bold text-primary',
                        )}
                      >
                        <th scope="row" className="py-2 text-left font-[inherit]">
                          {DAY_NAMES[d.dayOfWeek]}
                          {isToday && <span className="ml-2 text-label-sm">(today)</span>}
                        </th>
                        <td className="py-2 text-right">{hoursLabel(d) ?? 'Closed'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex flex-col gap-space-md rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm md:p-space-xl">
            <h2 className="text-headline-sm">About {cafe.name}</h2>
            <p className="text-body-md whitespace-pre-line text-on-surface-variant">
              {cafe.aboutText ?? 'More about the café will be added soon.'}
            </p>
            <div className="mt-auto flex flex-wrap gap-space-sm">
              <Link href="/menu" className={buttonClasses({})}>
                Browse the menu
              </Link>
              {isLive('/feedback') && (
                <Link href="/feedback" className={buttonClasses({ variant: 'secondary' })}>
                  Share feedback
                </Link>
              )}
            </div>
          </div>
        </Container>
      </section>

      {extras.reviews.length > 0 && (
        <section className="bg-surface-container-low py-space-2xl">
          <Container>
            <SectionHeading eyebrow="Guest feedback" title="What Café Guests Are Saying" />
            <ReviewList reviews={extras.reviews} />
          </Container>
        </section>
      )}
    </>
  )
}

/** Phone, email and social links: shown only when set; unverified ones are labelled. */
function ContactLinks({ cafe }: { cafe: CafeDto }) {
  const linkClass =
    'flex min-h-12 items-center gap-2 text-label-lg text-primary hover:underline break-all'
  const social = [
    { href: cafe.instagramUrl, label: 'Instagram' },
    { href: cafe.facebookUrl, label: 'Facebook' },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href))

  if (!cafe.phone && !cafe.email && social.length === 0) {
    return (
      <p className="text-body-md text-on-surface-variant">
        Phone and social links will be added once the café confirms them.
      </p>
    )
  }
  return (
    <ul className="flex flex-col">
      {cafe.phone && (
        <li>
          <a href={`tel:${cafe.phone}`} className={linkClass}>
            <Phone aria-hidden="true" className="size-4 shrink-0" /> {formatPhone(cafe.phone)}
            {!cafe.verified.contact && <ToBeConfirmed />}
          </a>
        </li>
      )}
      {cafe.email && (
        <li>
          <a href={`mailto:${cafe.email}`} className={linkClass}>
            <Mail aria-hidden="true" className="size-4 shrink-0" /> {cafe.email}
            {!cafe.verified.contact && <ToBeConfirmed />}
          </a>
        </li>
      )}
      {social.map((s) => (
        <li key={s.label}>
          <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <ExternalLink aria-hidden="true" className="size-4 shrink-0" /> {s.label}
            <span className="sr-only">(opens in a new tab)</span>
            {!cafe.verified.social && <ToBeConfirmed />}
          </a>
        </li>
      ))}
    </ul>
  )
}
