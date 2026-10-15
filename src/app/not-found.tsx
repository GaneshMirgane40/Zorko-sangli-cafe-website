import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/site/seo'
import { Container } from '@/components/ui/container'
import { LinkButton } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Page not found', robots: NO_INDEX }

// UI_SPEC §12.11
export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 items-center py-space-2xl">
      <Container className="flex flex-col items-center gap-space-md text-center">
        <p className="text-display-hero text-primary" aria-hidden="true">
          404
        </p>
        <h1 className="text-headline-lg-mobile md:text-headline-lg">Page not found</h1>
        <p className="max-w-md text-body-md text-on-surface-variant">
          The page you are looking for does not exist or has moved.
        </p>
        <LinkButton href="/">Go home</LinkButton>
      </Container>
    </main>
  )
}
