'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import type { GalleryImageDto } from '@/server/services/home'

/**
 * Gallery grid + lightbox (UI_SPEC §12.7). The Dialog handles Escape, the focus trap and focus
 * return; this component adds previous/next buttons and the arrow keys (wrapping around).
 */
export function GalleryGrid({ images }: { images: GalleryImageDto[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const current = open === null ? null : images[open]
  const step = (delta: number) =>
    setOpen((i) => (i === null ? i : (i + delta + images.length) % images.length))

  return (
    <>
      <ul className="grid grid-cols-2 gap-space-md md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo: ${img.altText}`}
              className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-surface-container shadow-sm"
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition motion-safe:group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {current && open !== null && (
        <Dialog
          open
          onClose={() => setOpen(null)}
          title={`Photo ${open + 1} of ${images.length}`}
          className="max-w-4xl"
        >
          <div
            className="flex flex-col gap-space-md"
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') step(-1)
              if (e.key === 'ArrowRight') step(1)
            }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-container">
              <Image
                src={current.url}
                alt={current.altText}
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-space-md">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                disabled={images.length < 2}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary hover:bg-surface-container-high disabled:opacity-40"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <p className="text-center text-body-md text-on-surface-variant" aria-live="polite">
                {current.caption ?? current.altText}
              </p>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                disabled={images.length < 2}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary hover:bg-surface-container-high disabled:opacity-40"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}
