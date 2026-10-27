/**
 * Public site navigation (UI_SPEC §8). A link is rendered only when its page exists (`live`), so the
 * site never shows dead links between phases (CLAUDE.md rule 7).
 */
export type NavItem = { href: string; label: string; shortLabel?: string; live: boolean }

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', live: true },
  { href: '/menu', label: 'Digital Menu', shortLabel: 'Menu', live: true },
  { href: '/offers', label: 'Offers & Combos', shortLabel: 'Offers', live: true },
  { href: '/student-zone', label: 'Student Zone', shortLabel: 'Students', live: true },
  { href: '/gallery', label: 'Gallery', live: true },
  { href: '/qr', label: 'Table QR', shortLabel: 'QR', live: true },
  { href: '/contact', label: 'About & Contact', live: true },
]

/** Secondary links (footer, mobile "More" sheet). */
export const MORE_ITEMS: NavItem[] = [
  { href: '/feedback', label: 'Guest Feedback', shortLabel: 'Feedback', live: true },
]

export const liveNav = () => NAV_ITEMS.filter((i) => i.live)
export const liveMore = () => MORE_ITEMS.filter((i) => i.live)
export const isLive = (href: string) =>
  [...NAV_ITEMS, ...MORE_ITEMS].some((i) => i.live && i.href === href)

/** Active state for nav links: exact for "/", prefix for sections (e.g. /menu/<slug>). */
export function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}
