'use client'

import { ZoomIn } from 'lucide-react'
import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ImageDto } from '@/server/services/menu'
import { ImageFallback } from './category-icon'

/** Main image + up to 4 thumbnails + zoom lightbox (UI_SPEC §12.3). */
export function ItemGallery({
  images,
  name,
  dimmed,
  overlay,
}: {
  images: ImageDto[]
  name: string
  dimmed: boolean
  overlay?: ReactNode
}) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const current = images[index]

  return (
    <div className="flex flex-col gap-space-sm rounded-3xl bg-surface-container-lowest p-space-sm shadow-md md:p-space-md">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        {current ? (
          <Image
            src={current.url}
            alt={current.altText}
            fill
            priority
            sizes="(min-width: 1024px) 600px, 100vw"
            className={cn('object-cover', dimmed && 'opacity-60 grayscale')}
          />
        ) : (
          <ImageFallback />
        )}
        {overlay}
        {current && (
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label={`Enlarge image of ${name}`}
            className="absolute right-3 bottom-3 inline-flex size-12 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow-md hover:bg-surface-container-lowest"
          >
            <ZoomIn aria-hidden="true" className="size-5" />
          </button>
        )}
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-space-sm" aria-label="More images">
          {images.slice(0, 4).map((img, i) => (
            <li key={img.url + i}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden rounded-xl ring-2',
                  i === index ? 'ring-primary' : 'ring-transparent hover:ring-outline-variant',
                )}
              >
                <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {current && (
        <Dialog open={zoom} onClose={() => setZoom(false)} title={name} className="max-w-3xl">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            <Image
              src={current.url}
              alt={current.altText}
              fill
              sizes="768px"
              className="object-contain"
            />
          </div>
        </Dialog>
      )}
    </div>
  )
}
