import { ArrowRight, CalendarClock, CircleCheck, GraduationCap, Info, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonClasses } from '@/components/ui/button'
import { PureVegPill } from '@/components/ui/veg-mark'
import { formatDateIST, formatRupees } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OfferDto } from '@/server/services/offers'

/** Whole-number "% OFF", rounded down so it never overstates the saving (TC-UNIT-021). */
export function percentOff(
  offer: Pick<OfferDto, 'savingsPaise' | 'regularPricePaise'>,
): number | null {
  if (!offer.savingsPaise || !offer.regularPricePaise) return null
  const pct = Math.floor((offer.savingsPaise / offer.regularPricePaise) * 100)
  return pct > 0 ? pct : null
}

const KIND_LABEL: Record<string, string> = {
  COMBO: 'Combo',
  DISCOUNT: 'Item deal',
  INFO: 'Special',
}

function OfferImage({ offer, className }: { offer: OfferDto; className?: string }) {
  return offer.image ? (
    <Image
      src={offer.image.url}
      alt={offer.image.altText}
      fill
      sizes="(min-width: 1024px) 260px, (min-width: 640px) 40vw, 100vw"
      className={cn(
        'object-cover transition-transform duration-500 motion-safe:group-hover:scale-105',
        className,
      )}
    />
  ) : (
    <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary to-primary-container text-on-primary">
      <Tag aria-hidden="true" className="size-12" />
    </div>
  )
}

/** Price, struck-through regular price and "% OFF" (UI_SPEC §7.6 combo card). */
export function OfferPrice({ offer, large = false }: { offer: OfferDto; large?: boolean }) {
  if (!offer.priceLabel) return null
  const pct = percentOff(offer)
  return (
    <div className="flex flex-col">
      <p className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-heading font-extrabold text-on-surface',
            large ? 'text-[32px] leading-8' : 'text-title-price',
          )}
        >
          {offer.priceLabel}
        </span>
        {offer.regularPriceLabel && offer.savingsPaise ? (
          <>
            <span className="sr-only">instead of</span>
            <s className="text-body-md text-on-surface-variant">{offer.regularPriceLabel}</s>
          </>
        ) : null}
      </p>
      {pct && <span className="text-label-sm text-tertiary uppercase">{pct}% off</span>}
    </div>
  )
}

/**
 * Combo / item-deal card (Stitch "Featured Combo Feasts"). "Claim Combo" from the mockup becomes
 * "View details": there is no ordering or voucher system (CLAUDE.md §6.3).
 */
export function OfferCard({ offer, pureVeg }: { offer: OfferDto; pureVeg: boolean }) {
  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-md transition-shadow hover:shadow-xl sm:flex-row"
      data-testid="offer-card"
    >
      <div className="relative h-44 overflow-hidden sm:h-auto sm:min-h-[240px] sm:w-2/5">
        <OfferImage offer={offer} />
        <span className="absolute top-3 left-3">
          <PureVegPill confirmed={pureVeg} className="bg-surface/90" />
        </span>
        {offer.savingsPaise ? (
          <span className="absolute bottom-3 left-3 rounded-md bg-secondary-container px-2.5 py-1 text-label-sm text-on-secondary-container uppercase shadow-sm">
            Save {formatRupees(offer.savingsPaise)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col justify-between gap-space-md p-space-lg sm:w-3/5">
        <div className="flex flex-col gap-space-xs">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-label-sm tracking-wider text-primary uppercase">
              {KIND_LABEL[offer.kind]}
            </span>
            {offer.isStudentOffer && (
              <Badge tone="student" icon={<GraduationCap aria-hidden="true" className="size-3" />}>
                Student
              </Badge>
            )}
          </p>
          <h3 className="text-headline-sm">
            <Link
              href={`/offers/${offer.slug}`}
              className="group-hover:text-primary after:absolute after:inset-0 after:content-['']"
              data-stretched-link
            >
              {offer.title}
            </Link>
          </h3>
          <p className="line-clamp-3 text-body-sm text-on-surface-variant">{offer.description}</p>
        </div>
        {offer.items.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-xl bg-surface-canvas-subtle p-space-sm text-body-sm">
            {offer.items.map((i) => (
              <li key={i.slug} className="flex items-center gap-1.5">
                <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-primary" />
                {i.quantity}× {i.name}
                {!i.isAvailable && <span className="text-error">(out of stock)</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-end justify-between gap-space-sm">
          <OfferPrice offer={offer} />
          <span aria-hidden="true" className={buttonClasses({ size: 'sm' })}>
            View details <ArrowRight className="size-4" />
          </span>
        </div>
        <p data-volatile className="text-body-sm text-on-surface-variant">
          Valid till {formatDateIST(offer.endsAt)}
        </p>
      </div>
    </article>
  )
}

/** Information-only offer (Stitch "Daily Limited-Time Specials"); no codes, no redemption. */
export function InfoOfferCard({ offer }: { offer: OfferDto }) {
  return (
    <article
      className="group relative flex flex-col gap-space-md rounded-3xl bg-surface-container-lowest p-space-xl shadow-lg"
      data-testid="offer-card"
    >
      <p className="flex items-center gap-2">
        <Badge tone="trending" icon={<Info aria-hidden="true" className="size-3" />}>
          Special
        </Badge>
        {offer.isStudentOffer && <Badge tone="student">Student</Badge>}
      </p>
      <h3 className="text-headline-md">
        <Link
          href={`/offers/${offer.slug}`}
          className="after:absolute after:inset-0 after:content-['']"
          data-stretched-link
        >
          {offer.title}
        </Link>
      </h3>
      <p className="text-body-md text-on-surface-variant">{offer.description}</p>
      <p data-volatile className="mt-auto text-body-sm text-on-surface-variant">
        Valid till {formatDateIST(offer.endsAt)}
      </p>
    </article>
  )
}

/** Scheduled offer ("Coming soon"): never shown as active. */
export function ScheduledOfferCard({ offer }: { offer: OfferDto }) {
  return (
    <article
      className="group relative flex min-w-0 items-center gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm"
      data-testid="offer-card"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant">
        <CalendarClock aria-hidden="true" className="size-6" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Badge tone="scheduled" className="self-start">
          <span data-volatile>Starts {formatDateIST(offer.startsAt)}</span>
        </Badge>
        <h3 className="truncate text-label-lg">
          <Link
            href={`/offers/${offer.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
            data-stretched-link
          >
            {offer.title}
          </Link>
        </h3>
      </div>
      {offer.priceLabel && (
        <span className="font-heading text-headline-sm font-extrabold text-primary">
          {offer.priceLabel}
        </span>
      )}
    </article>
  )
}
