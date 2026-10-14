import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import credits from '@/lib/site/image-credits.json'

export const metadata: Metadata = {
  title: 'Image credits',
  description: 'Sources and licences of the illustrative photos used on this site.',
  alternates: { canonical: '/credits' },
}

/**
 * Attribution for the illustrative menu photos (ADR-045). CC BY / CC BY-SA licences require the
 * title, author, source and licence; CC0 / public-domain photos are credited as a courtesy.
 */
export default function CreditsPage() {
  return (
    <main id="main" className="flex-1 py-space-xl">
      <Container className="flex max-w-3xl flex-col gap-space-md">
        <h1 className="text-headline-lg-mobile md:text-headline-lg">Image credits</h1>
        <p className="text-body-md text-on-surface-variant">
          Menu photos on this site are <strong>illustrative</strong>: they show similar dishes, not
          photos taken at ZORKO Sangli. They come from Wikimedia Commons and were cropped and
          resized. Real photos from the café will replace them.
        </p>
        <ul className="flex flex-col divide-y divide-surface-container rounded-2xl bg-surface-container-lowest px-space-md shadow-sm">
          {credits.map((c) => (
            <li key={c.key} className="flex flex-col gap-0.5 py-space-sm text-body-sm">
              <a
                href={c.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-label-lg text-primary hover:underline"
              >
                {c.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <span className="text-on-surface-variant">
                By {c.author} ·{' '}
                {c.licenseUrl ? (
                  <a
                    href={c.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {c.license}
                  </a>
                ) : (
                  c.license
                )}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  )
}
