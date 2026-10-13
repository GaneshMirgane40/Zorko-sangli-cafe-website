import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowRight, Flame, GraduationCap, UtensilsCrossed } from 'lucide-react'
import { Badge, AvailabilityLabel } from '@/components/ui/badge'
import { Button, LinkButton } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FilterChip, PillLink, PillRow } from '@/components/ui/chip'
import { Container } from '@/components/ui/container'
import { Checkbox, Radio, Select, TextArea, TextField } from '@/components/ui/field'
import { Pagination } from '@/components/ui/pagination'
import { Price } from '@/components/ui/price'
import { SearchField } from '@/components/ui/search-field'
import { SectionHeading } from '@/components/ui/section-heading'
import { MenuCardSkeleton, Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/states'
import { PureVegPill, VegMark } from '@/components/ui/veg-mark'
import { InteractiveDemos } from './interactive-demos'

export const metadata: Metadata = {
  title: 'Style guide',
  robots: { index: false, follow: false },
}

/** Development-only page (UI_SPEC §16). 404 in production unless ENABLE_STYLEGUIDE=true at build. */
function isEnabled() {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_STYLEGUIDE === 'true'
}

const swatches: Array<[name: string, hex: string, text: string]> = [
  ['primary', '#a93200', 'text-on-primary'],
  ['primary-container', '#d1430a', 'text-on-primary-container'],
  ['primary-fixed', '#ffdbd0', 'text-on-primary-fixed'],
  ['secondary', '#7c5800', 'text-on-secondary'],
  ['secondary-container', '#fcb812', 'text-on-secondary-container'],
  ['tertiary', '#006947', 'text-on-tertiary'],
  ['veg-pure-green', '#15803d', 'text-white'],
  ['error', '#ba1a1a', 'text-on-error'],
  ['surface', '#fcf9f8', 'text-on-surface'],
  ['surface-container-low', '#f6f3f2', 'text-on-surface'],
  ['surface-container', '#f0eded', 'text-on-surface'],
  ['surface-container-high', '#eae7e7', 'text-on-surface'],
  ['surface-warm-cream', '#fffbf5', 'text-on-surface'],
  ['surface-canvas-subtle', '#f7f8fa', 'text-on-surface'],
  ['on-surface-variant', '#5a4139', 'text-white'],
  ['inverse-surface', '#313030', 'text-inverse-on-surface'],
]

// Tailwind needs literal class names, so map swatch names to their bg classes explicitly.
const swatchBg: Record<string, string> = {
  primary: 'bg-primary',
  'primary-container': 'bg-primary-container',
  'primary-fixed': 'bg-primary-fixed',
  secondary: 'bg-secondary',
  'secondary-container': 'bg-secondary-container',
  tertiary: 'bg-tertiary',
  'veg-pure-green': 'bg-veg-pure-green',
  error: 'bg-error',
  surface: 'bg-surface',
  'surface-container-low': 'bg-surface-container-low',
  'surface-container': 'bg-surface-container',
  'surface-container-high': 'bg-surface-container-high',
  'surface-warm-cream': 'bg-surface-warm-cream',
  'surface-canvas-subtle': 'bg-surface-canvas-subtle',
  'on-surface-variant': 'bg-on-surface-variant',
  'inverse-surface': 'bg-inverse-surface',
}

const typeScale: Array<[token: string, className: string]> = [
  ['display-hero · Sora 48/56 800', 'text-display-hero'],
  ['display-hero-mobile · Sora 32/40 800', 'text-display-hero-mobile'],
  ['headline-lg · Sora 32/40 700', 'text-headline-lg'],
  ['headline-md · Sora 22/28 700', 'text-headline-md'],
  ['headline-sm · Sora 18/24 600', 'text-headline-sm'],
  ['body-lg · Jakarta 16/24 500', 'text-body-lg'],
  ['body-md · Jakarta 14/20 400', 'text-body-md'],
  ['body-sm · Jakarta 12/16 400', 'text-body-sm'],
  ['label-lg · Jakarta 14/18 700', 'text-label-lg'],
  ['label-md · Jakarta 12/16 700', 'text-label-md'],
  ['LABEL-SM · JAKARTA 10/12 800', 'text-label-sm uppercase'],
]

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="border-t border-outline-variant/50 py-space-xl">
      <h2 id={id} className="mb-space-lg text-headline-md">
        {title}
      </h2>
      {children}
    </section>
  )
}

/**
 * Reads ?page= from the URL. With Cache Components, request data must be read inside <Suspense>
 * so the rest of the page can still be prerendered as a static shell (the menu page uses the
 * same pattern).
 */
async function PaginationDemo({
  searchParams,
}: {
  searchParams: PageProps<'/dev/styleguide'>['searchParams']
}) {
  const params = await searchParams
  const page = Math.min(Math.max(Number(params.page) || 1, 1), 9)
  return <Pagination page={page} totalPages={9} basePath="/dev/styleguide" />
}

export default function StyleguidePage({ searchParams }: PageProps<'/dev/styleguide'>) {
  if (!isEnabled()) notFound()

  return (
    <main id="main" className="bg-surface pb-space-2xl">
      <div className="bg-surface-container-low py-space-xl">
        <Container>
          <p className="text-label-sm tracking-widest text-primary uppercase">Development only</p>
          <h1 className="text-display-hero-mobile md:text-display-hero">Component style guide</h1>
          <p className="mt-space-sm max-w-2xl text-body-lg text-on-surface-variant">
            Every UI primitive in each state, built from <code>docs/UI_SPEC.md</code>. Sample names
            and prices on this page are demo text, not café data.
          </p>
        </Container>
      </div>

      <Container>
        <Section id="sg-colors" title="Colour tokens">
          <ul className="grid grid-cols-2 gap-space-md sm:grid-cols-4 lg:grid-cols-8">
            {swatches.map(([name, hex, text]) => (
              <li
                key={name}
                className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm"
              >
                <div className={`flex h-16 items-end p-2 text-label-sm ${swatchBg[name]} ${text}`}>
                  Aa
                </div>
                <div className="p-2">
                  <p className="text-label-md break-all">{name}</p>
                  <p className="text-body-sm text-on-surface-variant">{hex}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="sg-type" title="Typography">
          <ul className="flex flex-col gap-space-md">
            {typeScale.map(([label, className]) => (
              <li key={label} className="flex flex-col gap-1">
                <span className="text-body-sm text-on-surface-variant">{label}</span>
                <span className={className}>Hungry? Bite into joy ₹149</span>
              </li>
            ))}
            <li className="flex flex-col gap-1">
              <span className="text-body-sm text-on-surface-variant">
                title-price · Sora 20/24 800
              </span>
              <Price paise={14900} />
            </li>
          </ul>
        </Section>

        <Section id="sg-radii" title="Radii and elevation">
          <div className="flex flex-wrap gap-space-md">
            {[
              ['rounded-lg · 8px', 'rounded-lg shadow-sm'],
              ['rounded-xl · 12px', 'rounded-xl shadow-sm'],
              ['rounded-2xl · 16px', 'rounded-2xl shadow-md'],
              ['rounded-3xl · 24px', 'rounded-3xl shadow-xl'],
              ['rounded-full · pill', 'rounded-full shadow-warm'],
            ].map(([label, cls]) => (
              <div
                key={label}
                className={`flex h-20 w-40 items-center justify-center bg-surface-container-lowest text-label-md ${cls}`}
              >
                {label}
              </div>
            ))}
          </div>
        </Section>

        <Section id="sg-buttons" title="Buttons">
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-wrap items-center gap-space-sm">
              <Button icon={<UtensilsCrossed aria-hidden="true" className="size-4" />}>
                Primary
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="whatsapp">WhatsApp</Button>
              <Button variant="destructive">Destructive</Button>
              <span className="rounded-2xl bg-primary p-2">
                <Button variant="inverse">Inverse</Button>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <Button size="sm">Small</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Saving</Button>
              <LinkButton
                href="/dev/styleguide#sg-buttons"
                variant="secondary"
                iconEnd={<ArrowRight aria-hidden="true" className="size-4" />}
              >
                Link button
              </LinkButton>
            </div>
          </div>
        </Section>

        <Section id="sg-forms" title="Form fields">
          <form
            className="grid max-w-3xl gap-space-lg md:grid-cols-2"
            action="/dev/styleguide"
            method="get"
          >
            <TextField
              label="Name or nickname"
              hint="Optional, up to 40 characters."
              name="name"
              maxLength={40}
            />
            <TextField
              label="Email"
              error="Enter a valid email address."
              defaultValue="not-an-email"
              name="email"
            />
            <Select label="Sort" name="sort" defaultValue="popular">
              <option value="popular">Popular first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </Select>
            <div className="flex flex-col gap-1.5">
              <span className="text-label-md">Search</span>
              <SearchField label="Search dishes" placeholder="Search dishes…" />
            </div>
            <TextArea
              label="Message"
              required
              hint="10–1000 characters."
              className="md:col-span-2"
              name="message"
            />
            <fieldset className="flex flex-col">
              <legend className="mb-1 text-label-md">Filters</legend>
              <Checkbox label="Popular only" name="popular" />
              <Checkbox label="Offers only" name="offers" defaultChecked />
              <Checkbox label="Disabled option" disabled />
            </fieldset>
            <fieldset className="flex flex-col">
              <legend className="mb-1 text-label-md">Price range</legend>
              <Radio label="All prices" name="price" value="" defaultChecked />
              <Radio label="Under ₹100" name="price" value="0-99" />
              <Radio label="₹100 – ₹200" name="price" value="100-200" />
              <Radio label="₹200+" name="price" value="201-" />
            </fieldset>
          </form>
        </Section>

        <Section id="sg-chips" title="Pills, chips and badges">
          <div className="flex flex-col gap-space-md">
            <PillRow aria-label="Example categories">
              <PillLink href="/dev/styleguide#sg-chips" active>
                All items
              </PillLink>
              {['Burgers', 'Pizzas', 'Momos', 'Wraps', 'Fries', 'Shakes', 'Desserts', 'Combos'].map(
                (c) => (
                  <PillLink key={c} href={`/dev/styleguide?category=${c.toLowerCase()}#sg-chips`}>
                    {c}
                  </PillLink>
                ),
              )}
            </PillRow>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Popular only" removeHref="/dev/styleguide#sg-chips" />
              <FilterChip label="₹100–₹200" removeHref="/dev/styleguide#sg-chips" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="bestSeller" icon={<Flame aria-hidden="true" className="size-3" />}>
                Best seller
              </Badge>
              <Badge tone="trending">Trending</Badge>
              <Badge tone="offer">Save ₹71</Badge>
              <Badge tone="featured">Featured</Badge>
              <Badge tone="outOfStock">Out of stock</Badge>
              <Badge tone="scheduled">Starts 1 Nov</Badge>
              <Badge tone="student" icon={<GraduationCap aria-hidden="true" className="size-3" />}>
                Student
              </Badge>
              <Badge tone="demo">Demo data</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-space-md">
              <AvailabilityLabel available />
              <AvailabilityLabel available={false} />
              <span className="inline-flex items-center gap-2 text-body-md">
                <VegMark diet="VEG" /> Veg
              </span>
              <span className="inline-flex items-center gap-2 text-body-md">
                <VegMark diet="NON_VEG" /> Non-veg
              </span>
              <span className="inline-flex items-center gap-2 text-body-md">
                <VegMark diet="EGG" /> Egg
              </span>
              <PureVegPill confirmed />
              <span className="text-body-sm text-on-surface-variant">
                (pill shows only when the café confirms — Q-06)
              </span>
            </div>
          </div>
        </Section>

        <Section id="sg-cards" title="Cards, prices and loading">
          <div className="grid gap-space-md md:grid-cols-2 xl:grid-cols-3">
            <Card interactive className="flex flex-col gap-space-sm">
              <div className="flex h-44 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant">
                <UtensilsCrossed aria-hidden="true" className="size-10" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-headline-sm">Demo item name</h3>
                <VegMark diet="VEG" />
              </div>
              <p className="line-clamp-2 text-body-sm text-on-surface-variant">
                Demo description text showing the two-line clamp used on menu cards.
              </p>
              <div className="mt-auto flex items-center justify-between pt-space-xs">
                <Price paise={9900} regularPaise={12900} />
                <AvailabilityLabel available />
              </div>
            </Card>
            <Card className="flex flex-col gap-space-sm">
              {/* Only the image is dimmed; text keeps full contrast (UI_SPEC V-13). */}
              <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-surface-container-high opacity-60 grayscale"
                />
                <span className="relative rounded-full bg-inverse-surface px-3 py-1 text-label-md text-inverse-on-surface">
                  Out of stock
                </span>
              </div>
              <h3 className="text-headline-sm">Unavailable demo item</h3>
              <p className="text-body-sm text-on-surface-variant">
                Unavailable state: greyed image and label.
              </p>
              <Price paise={11900} />
            </Card>
            <MenuCardSkeleton />
          </div>
          <div className="mt-space-md flex flex-col gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </Section>

        <Section id="sg-states" title="Empty state">
          <Card>
            <EmptyState
              title="No dishes match these filters"
              description="Try a different search or clear the filters."
              action={<LinkButton href="/dev/styleguide#sg-states">Clear all filters</LinkButton>}
            />
          </Card>
        </Section>

        <Section id="sg-interactive" title="Dialogs, toasts, switch and error state">
          <InteractiveDemos />
        </Section>

        <Section id="sg-pagination" title="Pagination">
          <Suspense fallback={<Pagination page={1} totalPages={9} basePath="/dev/styleguide" />}>
            <PaginationDemo searchParams={searchParams} />
          </Suspense>
        </Section>

        <Section id="sg-headings" title="Section heading">
          <SectionHeading
            eyebrow="Explore menu categories"
            title="Craving something delicious?"
            description="Section headings pair an eyebrow, a title and optional supporting text."
            action={
              <LinkButton href="/dev/styleguide#sg-headings" variant="secondary" size="sm">
                See all
              </LinkButton>
            }
          />
        </Section>
      </Container>
    </main>
  )
}
