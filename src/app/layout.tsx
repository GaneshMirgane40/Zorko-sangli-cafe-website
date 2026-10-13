import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Sora } from 'next/font/google'
import { publicEnv } from '@/lib/config/env'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

// Self-hosted at build time by next/font (no runtime request to Google) — ADR-007.
const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: 'ZORKO Sangli',
    template: '%s | ZORKO Sangli',
  },
  description: 'Digital menu, offers and café information for ZORKO Sangli.',
}

export const viewport: Viewport = {
  themeColor: '#a93200',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
