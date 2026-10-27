/**
 * Admin sidebar (UI_SPEC §8.4). Like the public nav (ADR-042), a module is listed only once it
 * exists, so the admin never sees dead links.
 */
import type { NavItem } from './nav'

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', live: true },
  { href: '/admin/menu', label: 'Menu items', live: true },
  { href: '/admin/categories', label: 'Categories', live: false }, // 5B
  { href: '/admin/offers', label: 'Offers & combos', live: false }, // 5C
  { href: '/admin/banners', label: 'Banners', live: false }, // 5C
  { href: '/admin/cafe', label: 'Café info', live: false }, // 5C
  { href: '/admin/gallery', label: 'Gallery', live: false }, // 5C
  { href: '/admin/feedback', label: 'Feedback', live: true },
  { href: '/admin/qr', label: 'Table QR code', live: true },
]

export const liveAdminNav = () => ADMIN_NAV.filter((i) => i.live)

/** Exact match for the dashboard, prefix match for modules (e.g. /admin/menu/123). */
export function isActiveAdminPath(pathname: string, href: string): boolean {
  return href === '/admin'
    ? pathname === '/admin'
    : pathname === href || pathname.startsWith(`${href}/`)
}
