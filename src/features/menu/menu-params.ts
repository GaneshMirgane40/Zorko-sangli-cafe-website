import {
  menuQuerySchema,
  PRICE_BANDS,
  type MenuQuery,
  type PriceBand,
} from '@/lib/validation/public'

/** URL keys the menu page understands (UI_SPEC §12.2: filters live in the URL). */
export const MENU_KEYS = [
  'q',
  'category',
  'price',
  'popular',
  'offers',
  'sort',
  'view',
  'page',
] as const
export type MenuParams = Partial<Record<(typeof MENU_KEYS)[number], string>>

type RawParams = Record<string, string | string[] | undefined>

/** Keep known keys, first value only. */
export function pickMenuParams(raw: RawParams): MenuParams {
  const out: MenuParams = {}
  for (const key of MENU_KEYS) {
    const v = raw[key]
    const value = Array.isArray(v) ? v[0] : v
    if (value) out[key] = value
  }
  return out
}

/**
 * Parses the page's URL into a MenuQuery. Unlike the JSON API (which answers 400), a page drops
 * invalid values one by one so a bad or stale link still shows the menu.
 */
export function parseMenuParams(params: MenuParams): { query: MenuQuery; params: MenuParams } {
  const clean: MenuParams = { ...params }
  for (let i = 0; i < MENU_KEYS.length; i++) {
    const { view, ...apiParams } = clean
    void view
    const result = menuQuerySchema.safeParse(apiParams)
    if (result.success) {
      if (clean.view && clean.view !== 'list') delete clean.view
      return { query: result.data, params: clean }
    }
    for (const issue of result.error.issues) delete clean[issue.path[0] as keyof MenuParams]
  }
  return { query: menuQuerySchema.parse({}), params: {} }
}

/** `/menu?…` with `changes` applied (undefined removes a key). Filter changes reset the page. */
export function menuHref(params: MenuParams, changes: MenuParams = {}): string {
  const next: MenuParams = { ...params, ...changes }
  if (!('page' in changes)) delete next.page
  const qs = new URLSearchParams()
  for (const key of MENU_KEYS) {
    const v = next[key]
    if (v) qs.set(key, v)
  }
  const s = qs.toString()
  return s ? `/menu?${s}` : '/menu'
}

export function activeFilterChips(
  params: MenuParams,
  categoryName: (slug: string) => string | undefined,
): { label: string; removeHref: string }[] {
  const chips: { label: string; removeHref: string }[] = []
  if (params.q)
    chips.push({ label: `“${params.q}”`, removeHref: menuHref(params, { q: undefined }) })
  if (params.category)
    chips.push({
      label: categoryName(params.category) ?? params.category,
      removeHref: menuHref(params, { category: undefined }),
    })
  if (params.price)
    chips.push({
      label: PRICE_BANDS[params.price as PriceBand]?.label ?? params.price,
      removeHref: menuHref(params, { price: undefined }),
    })
  if (params.popular)
    chips.push({ label: 'Popular', removeHref: menuHref(params, { popular: undefined }) })
  if (params.offers)
    chips.push({ label: 'On offer', removeHref: menuHref(params, { offers: undefined }) })
  return chips
}
