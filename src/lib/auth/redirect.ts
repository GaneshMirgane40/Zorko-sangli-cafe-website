/**
 * Where to go after login. Only internal admin paths are accepted, so `?next=` can never be
 * used as an open redirect (`//evil.com`, `https://…`, `/\evil`, encoded tricks).
 */
export function safeAdminNext(next: string | null | undefined): string {
  if (!next || next.length > 300) return '/admin'
  if (!/^\/admin(?:[/?#]|$)/.test(next)) return '/admin'
  if (/[\\\s]|\/\/|%2f|%5c/i.test(next)) return '/admin'
  if (next.startsWith('/admin/login')) return '/admin'
  return next
}
