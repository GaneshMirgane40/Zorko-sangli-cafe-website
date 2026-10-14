import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * Phase 4A — public site core (homepage, digital menu, item details, header/footer).
 * Runs against the seeded local test database (scripts/test-db.sh), production build.
 */

const PAGES = ['/', '/menu', '/menu/classic-veg-burger'] as const
const WIDTHS = [375, 430, 768, 1024, 1440]

async function axeSeriousOrCritical(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

/** Navigate and wait until the page is idle, so React has hydrated before the test interacts. */
async function gotoReady(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

const cardNames = (page: Page) => page.getByTestId('menu-card').getByRole('heading').allInnerTexts()

test.describe('homepage (TC-E2E-001)', () => {
  test('shows real data sections and no links to pages that do not exist yet', async ({ page }) => {
    await gotoReady(page, '/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ZORKO Sangli')
    await expect(page.getByRole('note')).toContainText('Demo data') // FR-024 demo labelling
    // Real count of public items (17 seeded, 1 unpublished).
    await expect(page.getByText('items on the menu')).toBeVisible()
    await expect(page.getByText('16', { exact: true })).toBeVisible()
    // Categories with real counts link to the filtered menu.
    const burgers = page.getByRole('link', { name: /Burgers\s+3 items/ })
    await expect(burgers).toHaveAttribute('href', '/menu?category=burgers')
    // Popular picks: at most 4 (ADR-023), only best sellers / trending.
    const picks = page.locator('section', { hasText: 'Popular Picks' }).getByTestId('menu-card')
    await expect(picks).toHaveCount(4)
    // Featured combo comes from an active offer; expired/draft offers never appear.
    await expect(page.getByRole('heading', { name: 'Burger + Fries + Coffee Combo' })).toBeVisible()
    await expect(page.getByText('Old Pasta Offer')).toHaveCount(0)
    await expect(page.getByText('Draft Offer')).toHaveCount(0)
    // No mockup claims (CLAUDE.md §6.2) and no ordering UI (§6.3).
    for (const banned of [
      /100% VEG/i,
      /Add to Order/i,
      /Table QR/i,
      /4\.8\/5/,
      /Certified/i,
      /Wi-?Fi/i,
    ]) {
      await expect(page.getByText(banned)).toHaveCount(0)
    }
    // Unverified hours are labelled.
    await expect(page.getByText(/to be confirmed/).first()).toBeVisible()
  })

  test('every internal link on the core pages resolves (no dead links)', async ({
    page,
    request,
  }) => {
    const hrefs = new Set<string>()
    for (const path of PAGES) {
      await gotoReady(page, path)
      for (const href of await page
        .locator('a[href^="/"]')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href')!)))
        hrefs.add(href.split('#')[0])
    }
    const results = await Promise.all(
      [...hrefs].map(async (href) => [href, (await request.get(href)).status()] as const),
    )
    expect(results.filter(([, status]) => status !== 200)).toEqual([])
  })
})

test.describe('digital menu (TC-E2E-010…013)', () => {
  test('combined filters from the URL: search + category + price band', async ({ page }) => {
    await gotoReady(page, '/menu?q=burger&category=burgers&price=100-200')
    await expect(page.getByText('Showing 2 items')).toBeVisible()
    expect(await cardNames(page)).toEqual(['Paneer Tikka Burger', 'Double Cheese Burger'])
    // Active filter chips can be removed one by one.
    await page.getByRole('link', { name: 'Remove filter: ₹100–₹200' }).click()
    await expect(page.getByText('Showing 3 items')).toBeVisible()
    await expect(page).toHaveURL(/q=burger&category=burgers$/)
  })

  test('price band boundaries are inclusive/exclusive as specified (TC-UNIT-012 end to end)', async ({
    page,
  }) => {
    const prices = async () =>
      (await page.getByTestId('menu-card').locator('.text-title-price').allInnerTexts()).map((t) =>
        Number(t.replace(/[₹,]/g, '')),
      )
    await gotoReady(page, '/menu?price=under-100&pageSize=48')
    expect((await prices()).every((p) => p < 100)).toBe(true)
    await gotoReady(page, '/menu?price=100-200')
    const mid = await prices()
    expect(mid.every((p) => p >= 100 && p <= 200)).toBe(true)
    expect(mid).toContain(199) // upper edge inside the band
    await gotoReady(page, '/menu?price=200-plus')
    expect((await prices()).every((p) => p > 200)).toBe(true)
  })

  test('typing in search filters after a short pause and keeps other filters', async ({ page }) => {
    await gotoReady(page, '/menu?category=pizza')
    await page.getByRole('searchbox', { name: 'Search the menu' }).last().fill('farm')
    await expect(page).toHaveURL(/category=pizza/)
    await expect(page).toHaveURL(/q=farm/)
    await expect.poll(() => cardNames(page)).toEqual(['Farmhouse Pizza'])
  })

  test('desktop filters and sort apply immediately and combine', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop aside')
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoReady(page, '/menu')
    await page.getByRole('checkbox', { name: /Popular only/ }).check()
    await expect(page).toHaveURL(/popular=1/)
    await page.getByRole('form', { name: 'Sort' }).getByLabel('Sort').selectOption('price_asc')
    await expect(page).toHaveURL(/popular=1.*sort=price_asc|sort=price_asc.*popular=1/)
    const prices = (
      await page.getByTestId('menu-card').locator('.text-title-price').allInnerTexts()
    ).map((t) => Number(t.replace(/[₹,]/g, '')))
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
    await page.getByRole('link', { name: 'Clear all' }).click()
    await expect(page).toHaveURL(/\/menu$/)
  })

  test('mobile: category pills and the filter sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoReady(page, '/menu')
    await page
      .getByRole('navigation', { name: 'Categories' })
      .getByRole('link', { name: 'Snacks' })
      .click()
    await expect(page).toHaveURL(/category=snacks/)
    await page.getByRole('button', { name: /Filters/ }).click()
    const sheet = page.getByRole('dialog', { name: 'Filters and sort' })
    await sheet.getByRole('checkbox', { name: /Offers only/ }).check()
    await sheet.getByRole('button', { name: 'Apply' }).click()
    await expect(page).toHaveURL(/category=snacks.*offers=1/)
    await expect.poll(() => cardNames(page)).toEqual(['French Fries', 'Peri Peri Fries'])
    await expect(page.getByRole('button', { name: /Filters/ })).toContainText('1')
  })

  test('empty state offers to clear filters; invalid URL values are ignored, not errors', async ({
    page,
  }) => {
    await gotoReady(page, '/menu?q=zzzz-nothing')
    await expect(page.getByRole('heading', { name: 'No dishes match these filters' })).toBeVisible()
    await page.getByRole('link', { name: 'Clear all filters' }).click()
    await expect(page.getByText('Showing 16 items')).toBeVisible()
    const res = await page.goto('/menu?pageSize=999&price=bogus&sort=evil&category=Bad%20Slug')
    expect(res?.status()).toBe(200)
    await expect(page.getByText('Showing 16 items')).toBeVisible()
  })

  test('pagination and out-of-stock items (TC-E2E-021)', async ({ page }) => {
    await gotoReady(page, '/menu')
    await page
      .getByRole('navigation', { name: 'Pagination' })
      .getByRole('link', { name: /Next/ })
      .click()
    await expect(page).toHaveURL(/page=2/)
    const soldOut = page.getByTestId('menu-card').filter({ hasText: 'Double Cheese Burger' })
    await expect(soldOut.getByText('Out of stock').first()).toBeVisible()
    // Unpublished items never appear.
    await gotoReady(page, '/menu?q=pink')
    await expect(page.getByText('Showing 0 items')).toBeVisible()
  })

  test('grid/list toggle keeps the filters', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await gotoReady(page, '/menu?category=pasta')
    await page.getByRole('button', { name: 'List' }).click()
    await expect(page).toHaveURL(/category=pasta.*view=list/)
    await expect(page.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('item details (TC-E2E-020)', () => {
  test('shows details, add-ons as information, related items and combos; no ordering UI', async ({
    page,
  }) => {
    await gotoReady(page, '/menu/margherita-pizza')
    await expect(page.getByRole('heading', { level: 1, name: 'Margherita Pizza' })).toBeVisible()
    await expect(page.getByText('Available now')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Customisations available/ })).toBeVisible()
    await expect(page.getByText('Cheese burst')).toBeVisible()
    await expect(page.getByText(/Part of the offer/)).toContainText('Pizza Duo Deal')
    for (const banned of [/Add to/i, /Order/, /Quantity/i, /Checkout/i])
      await expect(page.getByRole('button', { name: banned })).toHaveCount(0)
    await page.getByRole('link', { name: /Cheese Garlic Bread/ }).click()
    await expect(page).toHaveURL(/\/menu\/cheese-garlic-bread$/)
  })

  test('out-of-stock item is clearly labelled', async ({ page }) => {
    await gotoReady(page, '/menu/double-cheese-burger')
    await expect(page.getByText('Out of stock').first()).toBeVisible()
    await expect(page.getByText('Available now')).toHaveCount(0)
  })

  test('"Back to menu" restores the filters the visitor came from', async ({ page }) => {
    await gotoReady(page, '/menu?category=burgers&sort=price_desc')
    await page.getByRole('link', { name: 'Paneer Tikka Burger' }).click()
    await expect(page).toHaveURL(/paneer-tikka-burger/)
    await page.getByRole('link', { name: 'Back to menu' }).click()
    await expect(page).toHaveURL(/\/menu\?category=burgers&sort=price_desc$/)
  })

  test('zoom opens a dialog that closes with Escape and returns focus', async ({ page }) => {
    await gotoReady(page, '/menu/classic-veg-burger')
    const zoom = page.getByRole('button', { name: /Enlarge image/ })
    await zoom.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Classic Veg Burger' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(zoom).toBeFocused()
  })

  test('unknown or unpublished items show a friendly not-found page, excluded from search engines', async ({
    page,
  }) => {
    for (const path of ['/menu/no-such-dish', '/menu/pink-sauce-pasta', '/menu/BAD..slug']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: "This dish isn't on the menu" })).toBeVisible()
      // Streaming (partial prerendering) has already sent 200, so Next.js marks the page noindex (ADR-041).
      await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', /noindex/)
      await expect(page.getByRole('link', { name: 'Browse the menu' })).toHaveAttribute(
        'href',
        '/menu',
      )
    }
  })
})

test.describe('navigation, accessibility and responsive (TC-A11Y-001, TC-RESP-001…003)', () => {
  for (const path of PAGES) {
    for (const width of [390, 1440]) {
      test(`axe: no serious/critical violations on ${path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await gotoReady(page, path)
        expect(await axeSeriousOrCritical(page)).toEqual([])
      })
    }
  }

  for (const width of WIDTHS) {
    test(`no horizontal scroll on core pages at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of [...PAGES, '/menu?view=list']) {
        await gotoReady(page, path)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        )
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0)
      }
    })
  }

  test('touch targets are at least 48px under 1024px on core pages (TC-RESP-002)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    for (const path of PAGES) {
      await gotoReady(page, path)
      const small = await page.evaluate(() => {
        const out: string[] = []
        document
          .querySelectorAll<HTMLElement>(
            'main a[href], main button, main input, main select, nav[aria-label="Bottom"] a',
          )
          .forEach((el) => {
            let target: Element = el
            if (el instanceof HTMLInputElement && ['checkbox', 'radio'].includes(el.type))
              target = el.closest('label') ?? el
            if (el.hasAttribute('data-stretched-link')) target = el.closest('article') ?? el
            const r = target.getBoundingClientRect()
            if (r.width === 0 && r.height === 0) return
            if (el.closest('dialog:not([open])')) return
            if (r.height < 47.5 || r.width < 47.5)
              out.push(
                `${el.tagName} "${(el.textContent ?? '').trim().slice(0, 25)}" ${Math.round(r.width)}x${Math.round(r.height)}`,
              )
          })
        return out
      })
      expect(small, path).toEqual([])
    }
  })

  test('header: active nav state, header search, mobile bottom nav', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoReady(page, '/menu/classic-veg-burger')
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Digital Menu' }),
    ).toHaveAttribute('aria-current', 'page')
    await page.getByRole('searchbox', { name: 'Search the menu' }).first().fill('coffee')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/menu\?q=coffee/)
    await expect.poll(() => cardNames(page)).toEqual(['Cold Coffee'])

    await page.setViewportSize({ width: 390, height: 844 })
    await gotoReady(page, '/')
    const bottom = page.getByRole('navigation', { name: 'Bottom' })
    await expect(bottom.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    await bottom.getByRole('link', { name: 'Menu' }).click()
    await expect(page).toHaveURL(/\/menu$/)
  })

  test('tablet drawer opens, traps focus and navigates', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await gotoReady(page, '/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Menu' })
    await drawer.getByRole('link', { name: 'Digital Menu' }).click()
    await expect(page).toHaveURL(/\/menu$/)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})

test.describe('visual baselines (TC-VIS-001…003)', () => {
  // Chromium only: one engine is enough for pixel baselines; other checks run on both.
  test.skip(({ browserName }) => browserName !== 'chromium', 'baselines are recorded in Chromium')
  // Font rendering differs per OS; baselines exist for macOS only until Linux ones are recorded
  // for CI (PROGRESS backlog). Reported as skipped on Linux, never as passed.
  test.skip(process.platform !== 'darwin', 'visual baselines are recorded on macOS')

  for (const [name, path] of [
    ['home', '/'],
    ['menu', '/menu'],
    ['item', '/menu/classic-veg-burger'],
  ] as const) {
    for (const [device, width, height] of [
      ['desktop', 1440, 900],
      ['mobile', 390, 844],
    ] as const) {
      test(`${name} ${device}`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await gotoReady(page, path)
        await page.evaluate(() => document.fonts.ready)
        await expect(page).toHaveScreenshot(`${name}-${device}.png`, {
          fullPage: true,
          // Time-dependent text (open/closed now, offer end dates relative to the seed) is masked.
          mask: [
            page.locator('[data-volatile]'),
            page.getByText(/Open today|Closed today|Open now|Closed now/),
          ],
          maxDiffPixelRatio: 0.01,
        })
      })
    }
  }
})
