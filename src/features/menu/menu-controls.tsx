'use client'

import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button, buttonClasses } from '@/components/ui/button'
import { PillButton } from '@/components/ui/chip'
import { Dialog } from '@/components/ui/dialog'
import { Checkbox, Radio, Select } from '@/components/ui/field'
import { SearchField } from '@/components/ui/search-field'
import { PRICE_BAND_KEYS, PRICE_BANDS } from '@/lib/validation/public'
import { menuHref, type MenuParams } from './menu-params'

/**
 * Menu controls (UI_SPEC §12.2). Every control is a plain GET form field, so filtering works
 * without JavaScript; with JavaScript, next/form navigates client-side and changes apply at once.
 * Each form carries the other current params as hidden inputs, so filters combine.
 */

function Hidden({ params, omit }: { params: MenuParams; omit: (keyof MenuParams)[] }) {
  return (
    <>
      {Object.entries(params)
        .filter(([k, v]) => v && k !== 'page' && !omit.includes(k as keyof MenuParams))
        .map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
    </>
  )
}

/** A next/form that submits itself whenever one of its fields changes. */
function AutoForm({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLFormElement>(null)
  return (
    <Form
      ref={ref}
      action="/menu"
      aria-label={label}
      scroll={false}
      onChange={() => ref.current?.requestSubmit()}
    >
      {children}
      {/* Without JavaScript nothing auto-submits; this button covers that case. */}
      <noscript>
        <button type="submit" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
          Apply
        </button>
      </noscript>
    </Form>
  )
}

export const SORT_LABELS = {
  popular: 'Popular first',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  name: 'Name A–Z',
} as const

function FilterFields({ params }: { params: MenuParams }) {
  return (
    <>
      <Checkbox
        name="popular"
        value="1"
        label="Popular only"
        description="Best sellers and trending"
        defaultChecked={params.popular === '1'}
      />
      <Checkbox
        name="offers"
        value="1"
        label="Offers only"
        description="Items in a current offer"
        defaultChecked={params.offers === '1'}
      />
      <fieldset className="mt-space-sm">
        <legend className="px-2 pb-1 text-label-md text-on-surface">Price range</legend>
        <Radio name="price" value="" label="All prices" defaultChecked={!params.price} />
        {PRICE_BAND_KEYS.map((band) => (
          <Radio
            key={band}
            name="price"
            value={band}
            label={PRICE_BANDS[band].label}
            defaultChecked={params.price === band}
          />
        ))}
      </fieldset>
    </>
  )
}

function SortField({ params }: { params: MenuParams }) {
  return (
    <Select name="sort" label="Sort" defaultValue={params.sort ?? 'popular'}>
      {Object.entries(SORT_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  )
}

/** Desktop filter card body (aside). */
export function DesktopFilters({ params }: { params: MenuParams }) {
  return (
    <AutoForm label="Filters">
      <Hidden params={params} omit={['popular', 'offers', 'price']} />
      <FilterFields params={params} />
    </AutoForm>
  )
}

export function SortControl({ params }: { params: MenuParams }) {
  return (
    <AutoForm label="Sort">
      <Hidden params={params} omit={['sort']} />
      <SortField params={params} />
    </AutoForm>
  )
}

/** Search: submits on Enter, and 300 ms after typing stops (UI_SPEC §12.2). */
export function MenuSearch({ params }: { params: MenuParams }) {
  const ref = useRef<HTMLFormElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <Form ref={ref} action="/menu" role="search" scroll={false} className="flex-1">
      <Hidden params={params} omit={['q']} />
      <SearchField
        key={params.q ?? ''}
        label="Search the menu"
        placeholder="Search dishes, e.g. burger"
        defaultValue={params.q ?? ''}
        inputId="menu-search"
        onValueChange={() => {
          clearTimeout(timer.current)
          timer.current = setTimeout(() => ref.current?.requestSubmit(), 300)
        }}
      />
    </Form>
  )
}

/** Grid/list toggle; the choice is kept in the URL (`view=list`). */
export function ViewToggle({ params }: { params: MenuParams }) {
  const router = useRouter()
  const list = params.view === 'list'
  const go = (view?: string) =>
    router.replace(menuHref(params, { view, page: params.page }), { scroll: false })
  return (
    <div role="group" aria-label="Layout" className="hidden gap-1 sm:flex">
      <PillButton
        pressed={!list}
        onClick={() => go(undefined)}
        icon={<LayoutGrid aria-hidden="true" className="size-4" />}
      >
        Grid
      </PillButton>
      <PillButton
        pressed={list}
        onClick={() => go('list')}
        icon={<List aria-hidden="true" className="size-4" />}
      >
        List
      </PillButton>
    </div>
  )
}

/** Mobile (<1024): "Filters" button with the active count, opening a bottom sheet. */
export function MobileFilters({ params }: { params: MenuParams }) {
  const [open, setOpen] = useState(false)
  const count = [params.popular, params.offers, params.price].filter(Boolean).length
  return (
    <div className="lg:hidden">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        icon={<SlidersHorizontal aria-hidden="true" className="size-4" />}
      >
        Filters
        {count > 0 && <span className="rounded-full bg-primary px-2 text-on-primary">{count}</span>}
        {count > 0 && <span className="sr-only"> active</span>}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Filters and sort" placement="sheet">
        <Form
          action="/menu"
          scroll={false}
          onSubmit={() => setOpen(false)}
          className="flex flex-col gap-space-sm"
        >
          <Hidden params={params} omit={['popular', 'offers', 'price', 'sort']} />
          <FilterFields params={params} />
          <SortField params={params} />
          <div className="flex gap-space-sm pt-space-sm">
            <Link
              href={menuHref(params, {
                popular: undefined,
                offers: undefined,
                price: undefined,
                sort: undefined,
              })}
              onClick={() => setOpen(false)}
              className={buttonClasses({ variant: 'secondary', className: 'flex-1' })}
            >
              Reset
            </Link>
            <Button type="submit" className="flex-1">
              Apply
            </Button>
          </div>
        </Form>
      </Dialog>
    </div>
  )
}
