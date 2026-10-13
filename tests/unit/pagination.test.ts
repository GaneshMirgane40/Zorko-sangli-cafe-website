import { describe, expect, it } from 'vitest'
import { pageHref, visiblePages } from '@/components/ui/pagination'

describe('pagination helpers', () => {
  it('keeps filters and replaces the page param', () => {
    expect(pageHref('/menu', { q: 'burger', category: 'burgers', page: '3' }, 2)).toBe(
      '/menu?q=burger&category=burgers&page=2',
    )
  })
  it('omits page=1 and empty params', () => {
    expect(pageHref('/menu', { q: '', sort: undefined }, 1)).toBe('/menu')
  })
  it('shows first, last and neighbours with gaps', () => {
    expect(visiblePages(5, 9)).toEqual([1, 'gap', 4, 5, 6, 'gap', 9])
    expect(visiblePages(1, 3)).toEqual([1, 2, 3])
    expect(visiblePages(1, 1)).toEqual([1])
  })
})
