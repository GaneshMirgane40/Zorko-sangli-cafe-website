import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it } from 'vitest'
import { GalleryGrid } from '@/features/gallery/gallery-grid'

const images = [
  { id: 'a', url: '/demo/burgers.webp', altText: 'Seating area', caption: 'Our seating' },
  { id: 'b', url: '/demo/pizza.webp', altText: 'Counter', caption: null },
  { id: 'c', url: '/demo/snacks.webp', altText: 'Outside view', caption: null },
]

beforeAll(() => {
  // jsdom does not implement modal dialogs; emulate just the open state.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
})

describe('GalleryGrid lightbox (TC-COMP-010)', () => {
  it('opens the clicked photo, steps with buttons and arrow keys (wrapping), shows captions', async () => {
    const user = userEvent.setup()
    render(<GalleryGrid images={images} />)
    expect(screen.getAllByRole('button', { name: /^Open photo:/ })).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: 'Open photo: Counter' }))
    expect(screen.getByText('Photo 2 of 3')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Counter' })).toBeInTheDocument()
    // No caption → alt text is used as the caption.
    expect(screen.getAllByText('Counter').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByText('Photo 3 of 3')).toBeInTheDocument()

    await user.keyboard('{ArrowRight}') // wraps to the first photo
    expect(screen.getByText('Photo 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('Our seating')).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}') // wraps back to the last
    expect(screen.getByText('Photo 3 of 3')).toBeInTheDocument()
  })
})
