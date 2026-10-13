import { expect, test } from '@playwright/test'

/**
 * Public read API through the real production server (next build + next start) and the seeded
 * local test database. Detailed behaviour is covered by the integration tests; this proves the
 * deployed routing, runtime and headers (TC-INT-050, TC-INT-020, TC-INT-030).
 */
test.describe('public read API (Phase 3)', () => {
  test('menu list returns seeded demo items with pagination meta', async ({ request }) => {
    const res = await request.get('/api/v1/menu?category=burgers&sort=price_asc')
    expect(res.status()).toBe(200)
    expect(res.headers()['cache-control']).toContain('no-store')
    const body = await res.json()
    expect(body.meta).toEqual({ page: 1, pageSize: 12, total: 3, totalPages: 1 })
    expect(body.data.map((i: { slug: string }) => i.slug)).toEqual([
      'classic-veg-burger',
      'paneer-tikka-burger',
      'double-cheese-burger',
    ])
  })

  test('the seeded placeholder image URL is served locally', async ({ request }) => {
    const item = (await (await request.get('/api/v1/menu/classic-veg-burger')).json()).data
    expect(item.images[0].url).toBe('/demo/burgers.webp')
    const img = await request.get(item.images[0].url)
    expect(img.status()).toBe(200)
    expect(img.headers()['content-type']).toBe('image/webp')
  })

  test('invalid input and missing records give safe JSON errors', async ({ request }) => {
    const bad = await request.get('/api/v1/menu?pageSize=1000')
    expect(bad.status()).toBe(400)
    expect((await bad.json()).error.code).toBe('VALIDATION_ERROR')
    const missing = await request.get('/api/v1/menu/no-such-item')
    expect(missing.status()).toBe(404)
    expect(await missing.json()).toEqual({
      error: { code: 'NOT_FOUND', message: 'Menu item not found.' },
    })
  })

  test('offers never include expired ones; café info reports unverified placeholders', async ({
    request,
  }) => {
    const offers = (await (await request.get('/api/v1/offers')).json()).data
    const slugs = [...offers.active, ...offers.scheduled].map((o: { slug: string }) => o.slug)
    expect(slugs).not.toContain('old-pasta-offer')
    expect((await request.get('/api/v1/offers/old-pasta-offer')).status()).toBe(404)
    const cafe = (await (await request.get('/api/v1/cafe')).json()).data
    expect(cafe.isDemo).toBe(true)
    expect(cafe.verified.address).toBe(false)
  })

  test('API routes only answer GET', async ({ request }) => {
    const res = await request.post('/api/v1/menu', { data: {} })
    expect(res.status()).toBe(405)
  })
})
