import { CircleCheck, Flame } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'
import { VegMark, type DietType } from '@/components/ui/veg-mark'
import { formatDateIST } from '@/lib/format'
import { isLive } from '@/lib/site/nav'
import { slugSchema } from '@/lib/validation/public'
import { BackToMenu } from '@/features/menu/back-to-menu'
import { ImageFallback } from '@/features/menu/category-icon'
import { ItemGallery } from '@/features/menu/item-gallery'
import { ItemDetailSkeleton } from '@/features/menu/skeletons'
import { cachedItem } from '@/server/public-data'
import type { MenuItemCardDto, MenuItemDetailDto } from '@/server/services/menu'

async function loadItem(params: PageProps<'/menu/[slug]'>['params']) {
  const { slug } = await params
  const parsed = slugSchema.safeParse(slug)
  return parsed.success ? cachedItem(parsed.data) : null
}

export async function generateMetadata({ params }: PageProps<'/menu/[slug]'>): Promise<Metadata> {
  const item = await loadItem(params)
  if (!item) return { title: 'Item not found' }
  return {
    title: item.name,
    description: item.description.slice(0, 160),
    alternates: { canonical: `/menu/${item.slug}` },
    openGraph: { title: item.name, images: item.images[0] ? [item.images[0].url] : undefined },
  }
}

/**
 * Item details (UI_SPEC §12.3). No ordering UI: add-ons are information only.
 * The item streams in behind a skeleton. A missing item renders the not-found UI with
 * `noindex`; with partial prerendering the HTTP status is already 200 by then (ADR-041).
 */
export default function ItemPage({ params }: PageProps<'/menu/[slug]'>) {
  return (
    <main id="main" className="flex-1">
      <Suspense fallback={<ItemDetailSkeleton />}>
        <ItemLoader params={params} />
      </Suspense>
    </main>
  )
}

async function ItemLoader({ params }: Pick<PageProps<'/menu/[slug]'>, 'params'>) {
  const item = await loadItem(params)
  if (!item) notFound()
  return <ItemContent item={item} />
}

function ItemContent({ item }: { item: MenuItemDetailDto }) {
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
                href="/menu"
                className="inline-flex min-h-12 min-w-12 items-center hover:text-primary lg:min-h-0 lg:min-w-0"
              >
                Digital Menu
              </Link>{' '}
              /
            </li>
            <li>
              <Link
                href={`/menu?category=${item.category.slug}`}
                className="inline-flex min-h-12 min-w-12 items-center hover:text-primary lg:min-h-0 lg:min-w-0"
              >
                {item.category.name}
              </Link>{' '}
              /
            </li>
            <li aria-current="page" className="text-on-surface">
              {item.name}
            </li>
          </ol>
        </nav>
        <BackToMenu />
      </div>

      <div className="grid gap-space-lg lg:grid-cols-12">
        <div className="lg:sticky lg:top-32 lg:col-span-6 lg:self-start">
          <ItemGallery
            images={item.images}
            name={item.name}
            dimmed={!item.isAvailable}
            overlay={
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-surface-container-lowest/90 p-1.5">
                  <VegMark diet={item.dietType as DietType} />
                </span>
                {item.isBestSeller && (
                  <Badge tone="bestSeller" icon={<Flame aria-hidden="true" className="size-3" />}>
                    Best seller
                  </Badge>
                )}
                {item.isTrending && <Badge tone="trending">Trending</Badge>}
              </div>
            }
          />
        </div>

        <div className="flex flex-col gap-space-md lg:col-span-6">
          <section className="flex flex-col gap-space-sm rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm">
            <p className="text-label-sm tracking-widest text-primary uppercase">
              {item.category.name}
            </p>
            <h1 className="text-headline-lg-mobile md:text-headline-lg">{item.name}</h1>
            <div className="flex flex-wrap items-center gap-space-md">
              <span className="font-heading text-[32px] leading-8 font-extrabold text-primary">
                {item.priceLabel}
              </span>
              {item.isAvailable ? (
                <Badge
                  tone="neutral"
                  className="bg-[rgba(16,185,129,0.12)] text-tertiary"
                  icon={<CircleCheck aria-hidden="true" className="size-3" />}
                >
                  Available now
                </Badge>
              ) : (
                <Badge tone="outOfStock" className="px-3 py-1 text-label-md">
                  Out of stock
                </Badge>
              )}
            </div>
            <p className="text-body-md text-on-surface-variant">{item.description}</p>
            {item.activeDiscount && (
              <p
                data-volatile
                className="rounded-xl bg-secondary-container/20 p-space-sm text-body-sm text-on-surface"
              >
                Part of the offer <strong>{item.activeDiscount.title}</strong> —{' '}
                {item.activeDiscount.priceLabel}, valid till{' '}
                {formatDateIST(item.activeDiscount.endsAt)}.
              </p>
            )}
          </section>

          <AddOns groups={item.addOnGroups} />
          <CompactList title="Frequently bought together" items={item.frequentlyBoughtTogether} />
          <CompactList title="Related items" items={item.related} />
          <Combos combos={item.combos} />
        </div>
      </div>
    </Container>
  )
}

function AddOns({ groups }: { groups: MenuItemDetailDto['addOnGroups'] }) {
  if (groups.length === 0) return null
  return (
    <section
      aria-labelledby="addons-heading"
      className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm"
    >
      <h2 id="addons-heading" className="text-headline-sm">
        Customisations available — ask at the counter
      </h2>
      <div className="mt-space-sm flex flex-col gap-space-md">
        {groups.map((g) => (
          <div key={g.name}>
            <h3 className="flex items-baseline justify-between gap-space-sm text-label-lg">
              {g.name}
              <span className="text-body-sm font-normal text-on-surface-variant">
                {g.isRequired
                  ? `Choose ${g.minSelect === g.maxSelect ? g.minSelect : `${g.minSelect}–${g.maxSelect}`} · required`
                  : `Optional · up to ${g.maxSelect}`}
              </span>
            </h3>
            <ul className="mt-1 divide-y divide-surface-container">
              {g.options.map((o) => (
                <li key={o.name} className="flex justify-between py-2 text-body-md">
                  <span className={o.isAvailable ? '' : 'text-on-surface-variant line-through'}>
                    {o.name}
                    {!o.isAvailable && <span className="sr-only"> (unavailable)</span>}
                  </span>
                  <span className="text-on-surface-variant">
                    {o.priceDeltaPaise === 0 ? 'Included' : o.priceLabel}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function CompactList({ title, items }: { title: string; items: MenuItemCardDto[] }) {
  if (items.length === 0) return null
  return (
    <section className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm">
      <h2 className="text-headline-sm">{title}</h2>
      <ul className="mt-space-sm flex flex-col gap-1">
        {items.map((i) => (
          <li key={i.id}>
            <Link
              href={`/menu/${i.slug}`}
              className="flex min-h-12 items-center gap-space-sm rounded-xl p-1 hover:bg-surface-container-low"
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                {i.image ? (
                  <Image src={i.image.url} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <ImageFallback />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-label-lg">{i.name}</span>
                {!i.isAvailable && <span className="text-body-sm text-error">Out of stock</span>}
              </span>
              <span className="font-heading text-headline-sm font-extrabold text-primary">
                {i.priceLabel}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Combos({ combos }: { combos: MenuItemDetailDto['combos'] }) {
  if (combos.length === 0) return null
  const linkable = isLive('/offers')
  return (
    <section className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm">
      <h2 className="text-headline-sm">Combos with this item</h2>
      <ul className="mt-space-sm flex flex-col gap-space-sm">
        {combos.map((c) => {
          const body = (
            <>
              <span className="flex flex-col">
                <span className="text-label-lg">{c.title}</span>
                <span data-volatile className="text-body-sm text-on-surface-variant">
                  Valid till {formatDateIST(c.endsAt)}
                </span>
              </span>
              {c.priceLabel && (
                <span className="font-heading text-headline-sm font-extrabold text-primary">
                  {c.priceLabel}
                </span>
              )}
            </>
          )
          const cls =
            'flex min-h-12 items-center justify-between gap-space-sm rounded-xl bg-surface-canvas-subtle p-space-sm'
          return (
            <li key={c.slug}>
              {linkable ? (
                <Link
                  href={`/offers/${c.slug}`}
                  className={`${cls} hover:bg-surface-container-low`}
                >
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
