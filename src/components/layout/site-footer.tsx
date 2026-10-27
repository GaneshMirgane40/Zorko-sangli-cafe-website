import { Clock, ExternalLink, Lock, MapPin, Navigation, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPhone } from '@/lib/format'
import { VegMark } from '@/components/ui/veg-mark'
import { hoursLabel } from '@/features/cafe/hours'
import { liveMore, liveNav } from '@/lib/site/nav'
import type { CafeDto } from '@/server/services/cafe'
import { shortAddress } from './site-header'

/**
 * Public Footer styled after the signature ZORKO brand aesthetic:
 * - Fluid organic wave crest with a vibrant orange contour line
 * - Food & café doodles celebrating the "Brand of Food Lovers"
 * - Deep dark background with high-contrast white and warm amber typography
 * - Verified Sangli outlet location, daily schedule, and quick navigation
 */
export function SiteFooter({ cafe }: { cafe: CafeDto | null }) {
  const rawLinks = [...liveNav().filter((i) => i.href !== '/'), ...liveMore()]
  const links = Array.from(new Map(rawLinks.map((l) => [l.href, l])).values())
  const todaySchedule = cafe?.hours?.[0] ? hoursLabel(cafe.hours[0]) : null

  return (
    <footer className="relative bg-surface">
      {/* ── Signature ZORKO Wave Header ── */}
      <div className="relative w-full overflow-hidden leading-none select-none">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block h-10 w-full sm:h-14 md:h-18 lg:h-20"
          aria-hidden="true"
        >
          {/* Deep dark wave body */}
          <path
            d="M0,55 C280,10 450,15 680,50 C910,85 1070,80 1240,28 C1340,5 1400,15 1440,25 L1440,90 L0,90 Z"
            fill="#121110"
          />

          {/* Glowing amber secondary contour line */}
          <path
            d="M0,58 C280,13 450,18 680,53 C910,88 1070,83 1240,31 C1340,8 1400,18 1440,28"
            stroke="#fcb812"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* Bold brand orange contour line */}
          <path
            d="M0,55 C280,10 450,15 680,50 C910,85 1070,80 1240,28 C1340,5 1400,15 1440,25"
            stroke="#f18825"
            strokeWidth="3.5"
            fill="none"
          />
        </svg>
      </div>

      {/* ── Main Footer Body (Deep Dark Theme) ── */}
      <div className="bg-[#121110] text-[#e5e0df] pt-space-md pb-space-2xl">
        <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1480px] px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="grid gap-space-2xl sm:grid-cols-2 lg:grid-cols-12">
            
            {/* ── Column 1: Brand & Outlet Info (Col 1-4) ── */}
            <div className="flex flex-col gap-space-md lg:col-span-4">
              <Link href="/" className="group inline-block w-fit" aria-label="ZORKO Sangli — home">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo-dark.webp"
                    alt="ZORKO — Brand of Food Lovers"
                    width={150}
                    height={66}
                    className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                  <span className="rounded-full bg-[#f18825]/20 px-2.5 py-0.5 font-heading text-[11px] font-bold tracking-wider text-[#f18825] uppercase">
                    Sangli
                  </span>
                </div>
              </Link>

              {/* Social Icon Pills in Signature Brand Orange */}
              <div className="flex items-center gap-2.5 pt-1">
                {/* Instagram */}
                <a
                  href={cafe?.instagramUrl ?? 'https://www.instagram.com/zorkobrandoffoodlovers/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full bg-[#f18825] text-white transition-all hover:scale-110 hover:bg-[#d1430a] shadow-sm"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={cafe?.facebookUrl ?? 'https://www.facebook.com/zorkobrandoffoodlovers/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full bg-[#f18825] text-white transition-all hover:scale-110 hover:bg-[#d1430a] shadow-sm"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={cafe?.whatsappUrl ?? 'https://wa.me/919890011348'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full bg-[#f18825] text-white transition-all hover:scale-110 hover:bg-[#d1430a] shadow-sm"
                  aria-label="WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                  </svg>
                </a>

                {/* Google Maps Directions */}
                {cafe?.directionsUrl && (
                  <a
                    href={cafe.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-9 items-center justify-center rounded-full bg-[#f18825] text-white transition-all hover:scale-110 hover:bg-[#d1430a] shadow-sm"
                    aria-label="Get Directions on Google Maps"
                  >
                    <Navigation aria-hidden="true" className="size-4" />
                  </a>
                )}
              </div>

              {/* Outlet Address with Orange Pin */}
              {cafe && (
                <div className="flex flex-col gap-2.5 pt-2 text-body-sm text-[#b8b2b0]">
                  <div className="flex items-start gap-2.5">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#f18825]" />
                    <p className="leading-snug">
                      <span className="font-semibold text-white">Sangli Outlet:</span>{' '}
                      {shortAddress(cafe)}
                    </p>
                  </div>

                  {cafe.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone aria-hidden="true" className="size-4 shrink-0 text-[#f18825]" />
                      <a
                        href={`tel:${cafe.phone}`}
                        className="font-semibold text-white transition-colors hover:text-[#f18825]"
                      >
                        {formatPhone(cafe.phone)}
                      </a>
                    </div>
                  )}

                  {cafe.isPureVegConfirmed && (
                    <div className="mt-1 flex items-center gap-2">
                      <VegMark diet="VEG" size="sm" />
                      <span className="text-label-sm font-semibold tracking-wide text-[#22c55e] uppercase">
                        100% Pure Vegetarian Café
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Column 2: Information & About (Col 5-7) ── */}
            <div className="flex flex-col gap-space-sm lg:col-span-3">
              <h2 className="font-heading text-headline-sm font-bold tracking-tight text-white">
                Information
              </h2>
              <ul className="flex flex-col gap-2 pt-1 text-body-sm text-[#b8b2b0]">
                <li>
                  <Link href="/contact" className="transition-colors hover:text-[#f18825]">
                    About ZORKO Sangli
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition-colors hover:text-[#f18825]">
                    Outlet Location &amp; Directions
                  </Link>
                </li>
                <li>
                  <Link href="/student-zone" className="transition-colors hover:text-[#f18825]">
                    Student Zone Special Deals
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="transition-colors hover:text-[#f18825]">
                    Café Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/credits" className="transition-colors hover:text-[#f18825]">
                    Image &amp; Photo Credits
                  </Link>
                </li>
              </ul>
            </div>

            {/* ── Column 3: Quick Links (Col 8-9) ── */}
            <nav aria-label="Footer Navigation" className="flex flex-col gap-space-sm lg:col-span-2">
              <h2 className="font-heading text-headline-sm font-bold tracking-tight text-white">
                Quick Links
              </h2>
              <ul className="flex flex-col gap-2 pt-1 text-body-sm text-[#b8b2b0]">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition-colors hover:text-[#f18825]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ── Column 4: Opening Hours & Schedule Card (Col 10-12) ── */}
            {cafe && (
              <div className="flex flex-col gap-space-sm lg:col-span-3">
                <h2 className="font-heading text-headline-sm font-bold tracking-tight text-white">
                  Opening Hours
                </h2>
                
                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#1b1a19] p-space-md shadow-inner">
                  <div className="flex items-start gap-2.5">
                    <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#f18825]" />
                    <div className="flex flex-col">
                      <p className="text-body-sm font-semibold text-white">Daily Timings</p>
                      <p className="text-body-sm text-[#d4cecc]">
                        {todaySchedule ?? '11:00 AM – 11:00 PM'}
                      </p>
                      <p className="text-label-sm text-[#9e9694]">Monday through Sunday</p>
                    </div>
                  </div>

                  {!cafe.verified.hours && (
                    <p className="text-label-sm text-[#9e9694] italic border-t border-white/5 pt-2">
                      Hours to be confirmed by the café.
                    </p>
                  )}

                  {/* Open Status Badge */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 text-label-sm">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`size-2.5 rounded-full ${cafe.openNow ? 'bg-[#22c55e] animate-pulse' : 'bg-[#8e7067]'}`}
                      />
                      <span className={cafe.openNow ? 'font-medium text-[#22c55e]' : 'text-[#b8b2b0]'}>
                        {cafe.openNow ? 'Open right now' : 'Closed now'}
                      </span>
                    </div>

                    {cafe.directionsUrl && (
                      <a
                        href={cafe.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#f18825] hover:underline"
                      >
                        <span>Directions</span>
                        <ExternalLink aria-hidden="true" className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── Bottom Bar: Copyright & Attribution ── */}
          <div className="mt-space-2xl border-t border-white/10 pt-space-lg">
            <div className="flex flex-col items-center justify-between gap-3 text-center text-body-sm text-[#9e9694] sm:flex-row sm:text-left">
              <p>
                © {new Date().getFullYear()} ZORKO Sangli — Student project, not an official ZORKO website.
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <span>Menu photos are illustrative</span>
                <span>·</span>
                <Link
                  href="/credits"
                  className="underline transition-colors hover:text-[#f18825]"
                >
                  Image credits
                </Link>
                <span>·</span>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-[#b8b2b0] transition-colors hover:text-[#f18825]"
                >
                  <Lock aria-hidden="true" className="size-3" />
                  <span>Staff Portal</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

