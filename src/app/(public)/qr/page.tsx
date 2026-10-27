import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { QrGenerator } from '@/features/qr/qr-generator'
import { publicEnv } from '@/lib/config/env'
import { pageMetadata } from '@/lib/site/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Table QR Menu',
  description: 'Scan or print table QR codes for the ZORKO Sangli live digital menu.',
  path: '/qr',
})

export default function QrPage() {
  return (
    <main id="main" className="flex-1">
      {/* ── Page Header ── */}
      <div className="bg-surface-warm-cream print:hidden">
        <Container className="flex flex-col gap-1 py-space-lg">
          <h1 className="text-headline-lg-mobile md:text-headline-lg">
            Table QR Menu Generator
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Generate and print branded tabletop QR cards for each dining table. Dine-in customers can
            scan with their camera to instantly browse our digital menu and current offers.
          </p>
        </Container>
      </div>

      <Container className="py-space-xl">
        <QrGenerator siteUrl={publicEnv.siteUrl} />
      </Container>
    </main>
  )
}

