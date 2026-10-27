'use client'

import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
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
      <ul
        className={cn(
          'grid gap-6 md:gap-8 mx-auto w-full',
          images.length <= 2
            ? 'max-w-4xl grid-cols-1 md:grid-cols-2'
            : images.length === 3
              ? 'max-w-5xl grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        )}
      >
        {images.map((img, i) => (
          <li key={img.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo: ${img.altText}`}
              className="group relative block aspect-[4/3] sm:aspect-[5/4] w-full overflow-hidden rounded-3xl border border-surface-container-high bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 500px, (min-width: 768px) 50vw, 100vw"
                className="object-cover object-center transition-transform duration-500 motion-safe:group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-label-sm font-bold text-primary shadow-lg backdrop-blur-md">
                  <Maximize2 className="size-3.5" aria-hidden="true" />
                  <span>View full photo</span>
                </span>
              </div>
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
            <div className="relative h-[65dvh] max-h-[640px] w-full overflow-hidden rounded-2xl bg-black/95 flex items-center justify-center p-2">
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
