import { Container } from '@/components/ui/container'
import { LinkButton } from '@/components/ui/button'

/**
 * Temporary home page for the Phase 2 foundation. The real homepage (UI_SPEC §12.1) is built in
 * Phase 4A; until then this page states plainly that the site is not live.
 */
export default function HomePage() {
  const showStyleguide =
    process.env.NODE_ENV !== 'production' || process.env.ENABLE_STYLEGUIDE === 'true'

  return (
    <main id="main" className="flex flex-1 items-center bg-surface-container-low py-space-2xl">
      <Container className="flex flex-col items-start gap-space-lg">
        <div className="flex items-center gap-space-sm">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-heading text-headline-sm font-extrabold text-on-primary"
          >
            Z
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-headline-sm font-extrabold">ZORKO</span>
            <span className="text-label-sm tracking-widest text-primary uppercase">Sangli</span>
          </span>
        </div>
        <h1 className="max-w-2xl text-display-hero-mobile md:text-display-hero">
          Website under construction
        </h1>
        <p className="max-w-xl text-body-lg text-on-surface-variant">
          The digital menu, offers and café information will appear here once the site is ready.
          This is a student project and not an official ZORKO website.
        </p>
        {showStyleguide && (
          <LinkButton href="/dev/styleguide" variant="secondary">
            Open the component style guide
          </LinkButton>
        )}
      </Container>
    </main>
  )
}
