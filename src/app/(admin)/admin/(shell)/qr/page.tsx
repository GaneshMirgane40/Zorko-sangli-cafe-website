import type { Metadata } from 'next'
import { connection } from 'next/server'
import { QrGenerator } from '@/features/qr/qr-generator'
import { publicEnv } from '@/lib/config/env'
import { requireAdmin } from '@/server/auth/admin'

export const metadata: Metadata = { title: 'Table QR Code Generator' }

export default async function AdminQrPage() {
  await connection()
  await requireAdmin('/admin/qr')

  return (
    <div className="flex flex-col gap-space-xl">
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-lg-mobile md:text-headline-lg">Table QR Code Generator</h1>
        <p className="text-body-md text-on-surface-variant">
          Print or download table standees and tent cards for café tables. Customers can scan the
          code to directly open the digital menu on their smartphones.
        </p>
      </header>

      <QrGenerator siteUrl={publicEnv.siteUrl} />
    </div>
  )
}

