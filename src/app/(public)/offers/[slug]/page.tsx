import { CalendarClock, CircleCheck, GraduationCap, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import { NO_INDEX, pageMetadata } from '@/lib/site/seo'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import { buttonClasses } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { PureVegPill } from '@/components/ui/veg-mark'
import { OfferPrice } from '@/features/offers/offer-cards'
import { ItemDetailSkeleton } from '@/features/menu/skeletons'
import { formatDateIST, formatRupees } from '@/lib/format'
import { slugSchema } from '@/lib/validation/public'
import { cachedCafe, cachedOffer } from '@/server/public-data'
import type { OfferDto } from '@/server/services/offers'

async function loadOffer(params: PageProps<'/offers/[slug]'>['params']) {
  const parsed = slugSchema.safeParse((await params).slug)
  return parsed.success ? cachedOffer(parsed.data) : null
}

export async function generateMetadata({ params }: PageProps<'/offers/[slug]'>): Promise<Metadata> {
  const offer = await loadOffer(params)
  if (!offer) return { title: 'Offer not found', robots: NO_INDEX }
  return pageMetadata({
    title: offer.title,
    description: offer.description.slice(0, 160),
    path: `/offers/${offer.slug}`,
    image: offer.image ? { url: offer.image.url, alt: offer.image.altText } : null,
  })
}

/** Offer details (UI_SPEC §12.5). Expired or unpublished offers show the not-found page (ADR-041). */
export default function OfferPage({ params }: PageProps<'/offers/[slug]'>) {
  return (
    <main id="main" className="flex-1">
      <Suspense fallback={<ItemDetailSkeleton />}>
        <OfferLoader params={params} />
      </Suspense>
    </main>
  )
}

async function OfferLoader({ params }: Pick<PageProps<'/offers/[slug]'>, 'params'>) {
  const [offer, cafe] = await Promise.all([loadOffer(params), cachedCafe()])
  if (!offer) notFound()
  return <OfferContent offer={offer} pureVeg={cafe?.isPureVegConfirmed ?? false} />
}

function OfferContent({ offer, pureVeg }: { offer: OfferDto; pureVeg: boolean }) {
  const scheduled = offer.status === 'scheduled'
  return (
    <Container className="flex flex-col gap-space-lg py-space-lg lg:py-space-xl">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-body-sm text-on-surface-variant">
            <li>
              <Link
                href="/"
                className="inline-flex min-h-12 min-w-12 items-center hover:text-primary lg:min-h-0 lg:min-w-0"
              >
                Home
              </Link>{' '}
              /
            </li>
            <li>
              <Link
                href="/offers"
                className="inline-flex min-h-12 min-w-12 items-center hover:text-primary lg:min-h-0 lg:min-w-0"
              >
                Offers
              </Link>{' '}
              /
            </li>
            <li aria-current="page" className="text-on-surface">
              {offer.title}
            </li>
          </ol>
        </nav>
        <Link href="/offers" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
          All offers
        </Link>
      </div>

      <div className="grid gap-space-lg lg:grid-cols-12">
        <div className="lg:sticky lg:top-32 lg:col-span-6 lg:self-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-surface-container shadow-md">
            {offer.image ? (
              <Image
                src={offer.image.url}
                alt={offer.image.altText}
                fill
                priority
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary to-primary-container text-on-primary">
                <Tag aria-hidden="true" className="size-16" />
              </div>
            )}
            <span className="absolute top-3 left-3">
              <PureVegPill confirmed={pureVeg} className="bg-surface/90" />
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-space-md lg:col-span-6">
          <section className="flex flex-col gap-space-sm rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm">
            <p className="flex flex-wrap items-center gap-2">
              {scheduled ? (
                <Badge
                  tone="scheduled"
                  icon={<CalendarClock aria-hidden="true" className="size-3" />}
                >
                  <span data-volatile>Starts {formatDateIST(offer.startsAt)}</span>
                </Badge>
              ) : (
                <Badge tone="neutral" className="bg-[rgba(16,185,129,0.12)] text-tertiary">
                  Active now
                </Badge>
              )}
              {offer.isStudentOffer && (
                <Badge
                  tone="student"
                  icon={<GraduationCap aria-hidden="true" className="size-3" />}
                >
                  Student Zone
                </Badge>
              )}
            </p>
            <h1 className="text-headline-lg-mobile md:text-headline-lg">{offer.title}</h1>
            <OfferPrice offer={offer} large />
            {offer.savingsPaise ? (
              <p className="text-label-md text-tertiary">
                You save {formatRupees(offer.savingsPaise)} compared with ordering separately
              </p>
            ) : null}
            <p className="text-body-md whitespace-pre-line text-on-surface-variant">
              {offer.description}
            </p>
            <p data-volatile className="text-body-sm text-on-surface-variant">
              Valid {formatDateIST(offer.startsAt)} – {formatDateIST(offer.endsAt)} (ends at the
              start of the last day shown)
            </p>
            {offer.isStudentOffer && (
              <p className="text-body-sm text-on-surface-variant">
                Student Zone offers are information only; this website does not check student IDs.
              </p>
            )}
          </section>

          {offer.items.length > 0 && (
            <section className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm">
              <h2 className="text-headline-sm">Included</h2>
              <ul className="mt-space-sm flex flex-col gap-1">
                {offer.items.map((i) => (
                  <li key={i.slug}>
                    <Link
                      href={`/menu/${i.slug}`}
                      className="flex min-h-12 items-center gap-space-sm rounded-xl px-space-sm hover:bg-surface-container-low"
                    >
                      <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-primary" />
                      <span className="flex-1 text-label-lg">
                        {i.quantity}× {i.name}
                      </span>
                      {!i.isAvailable && (
                        <span className="text-body-sm text-error">Out of stock</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Container>
  )
}
