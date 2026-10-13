import { describe, expect, it } from 'vitest'
import { cleanText, menuQuerySchema, offersQuerySchema, slugSchema } from '@/lib/validation/public'

describe('menuQuerySchema (TC-UNIT-010)', () => {
  it('applies defaults when nothing is given', () => {
    expect(menuQuerySchema.parse({})).toEqual({ sort: 'popular', page: 1, pageSize: 12 })
  })
  it('treats empty values as not set', () => {
    expect(menuQuerySchema.parse({ q: '', category: '', minPrice: '', page: '' })).toEqual({
      sort: 'popular',
      page: 1,
      pageSize: 12,
    })
  })
  it('parses a full valid query', () => {
    expect(
      menuQuerySchema.parse({
        q: '  paneer  ',
        category: 'burgers',
        minPrice: '100',
        maxPrice: '200',
        popular: '1',
        offers: '1',
        sort: 'price_asc',
        page: '2',
        pageSize: '24',
      }),
    ).toEqual({
      q: 'paneer',
      category: 'burgers',
      minPrice: 100,
      maxPrice: 200,
      popular: '1',
      offers: '1',
      sort: 'price_asc',
      page: 2,
      pageSize: 24,
    })
  })
  it.each([
    [{ pageSize: '500' }, 'pageSize'],
    [{ pageSize: '0' }, 'pageSize'],
    [{ page: '0' }, 'page'],
    [{ page: '1.5' }, 'page'],
    [{ q: 'x'.repeat(61) }, 'q'],
    [{ sort: 'evil' }, 'sort'],
    [{ category: 'Bad Slug' }, 'category'],
    [{ category: '../etc' }, 'category'],
    [{ minPrice: '-1' }, 'minPrice'],
    [{ maxPrice: '100001' }, 'maxPrice'],
    [{ maxPrice: '99.5' }, 'maxPrice'],
    [{ minPrice: 'abc' }, 'minPrice'],
    [{ minPrice: '300', maxPrice: '100' }, 'minPrice'],
    [{ popular: 'true' }, 'popular'],
    [{ offers: '0' }, 'offers'],
  ])('rejects %o', (input, field) => {
    const result = menuQuerySchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.issues.map((i) => i.path[0])).toContain(field)
  })
  it('accepts the price boundaries 0 and 100000 and equal min/max', () => {
    expect(menuQuerySchema.parse({ minPrice: '0', maxPrice: '100000' }).maxPrice).toBe(100000)
    expect(menuQuerySchema.parse({ minPrice: '99', maxPrice: '99' }).minPrice).toBe(99)
  })
  it('strips control characters and collapses whitespace in q; blank q is dropped', () => {
    expect(menuQuerySchema.parse({ q: 'veg\u0000\n\tburger' }).q).toBe('veg burger')
    expect(menuQuerySchema.parse({ q: '   ' }).q).toBeUndefined()
    expect(cleanText('  a\u007Fb  ')).toBe('a b')
  })
})

describe('slugSchema and offersQuerySchema', () => {
  it.each(['burger', 'veg-burger-2', 'a'])('accepts slug %s', (s) =>
    expect(slugSchema.safeParse(s).success).toBe(true),
  )
  it.each(['', 'Burger', 'veg_burger', '-a', 'a-', 'a--b', "a';--", 'a/b', 'x'.repeat(91)])(
    'rejects slug %j',
    (s) => expect(slugSchema.safeParse(s).success).toBe(false),
  )
  it('parses offer filters and rejects unknown kinds', () => {
    expect(offersQuerySchema.parse({ kind: 'combo', student: '1' })).toEqual({
      kind: 'combo',
      student: '1',
    })
    expect(offersQuerySchema.safeParse({ kind: 'COMBO' }).success).toBe(false)
  })
})
