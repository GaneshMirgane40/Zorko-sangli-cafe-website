import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MenuCard } from '@/features/menu/menu-card'
import type { MenuItemCardDto } from '@/server/services/menu'

const base: MenuItemCardDto = {
  id: '1',
  slug: 'classic-veg-burger',
  name: 'Classic Veg Burger',
  description: 'Demo item',
  pricePaise: 9900,
  priceLabel: '₹99',
  dietType: 'VEG',
  isAvailable: true,
  isBestSeller: false,
  isTrending: false,
  isFeatured: false,
  hasActiveOffer: false,
  category: { slug: 'burgers', name: 'Burgers' },
  image: { url: '/demo/burgers.webp', altText: 'Classic Veg Burger — demo placeholder image' },
}

describe('MenuCard (TC-COMP-002)', () => {
  it('is one link to the item page with name, price and veg mark', () => {
    render(<MenuCard item={base} />)
    const card = screen.getByTestId('menu-card')
    expect(within(card).getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Classic Veg Burger' })).toHaveAttribute(
      'href',
      '/menu/classic-veg-burger',
    )
    expect(card).toHaveTextContent('₹99')
    expect(screen.getByRole('img', { name: 'Vegetarian' })).toBeInTheDocument()
    expect(screen.getByAltText(/demo placeholder image/)).toBeInTheDocument()
  })

  it('labels unavailable items "Out of stock" and never "Available"', () => {
    render(<MenuCard item={{ ...base, isAvailable: false, isBestSeller: true }} />)
    const card = screen.getByTestId('menu-card')
    expect(within(card).getAllByText('Out of stock').length).toBeGreaterThan(0)
    expect(within(card).queryByText('Available')).toBeNull()
    expect(within(card).queryByText('Best seller')).toBeNull() // out of stock wins (UI_SPEC §7.6)
    expect(screen.getByRole('img', { name: /demo placeholder/ }).className).toContain('grayscale')
  })

  it('shows one badge by priority: best seller > offer > trending', () => {
    const { rerender } = render(
      <MenuCard item={{ ...base, isBestSeller: true, hasActiveOffer: true, isTrending: true }} />,
    )
    expect(screen.getByText('Best seller')).toBeInTheDocument()
    expect(screen.queryByText('Offer')).toBeNull()
    rerender(<MenuCard item={{ ...base, hasActiveOffer: true, isTrending: true }} />)
    expect(screen.getByText('Offer')).toBeInTheDocument()
    expect(screen.queryByText('Trending')).toBeNull()
    rerender(<MenuCard item={{ ...base, isTrending: true }} />)
    expect(screen.getByText('Trending')).toBeInTheDocument()
  })

  it('falls back to a neutral tile when there is no image', () => {
    render(<MenuCard item={{ ...base, image: null }} />)
    expect(screen.queryByRole('img', { name: /placeholder/ })).toBeNull()
  })

  it('has no ordering controls (CLAUDE.md §6.3)', () => {
    render(<MenuCard item={base} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByText(/add/i)).toBeNull()
  })
})
