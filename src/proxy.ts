import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Admin proxy (Next.js 16 `proxy`, formerly `middleware`). It refreshes the Supabase session
 * cookie and sends visitors without a valid session to the login page. It is a convenience,
 * NOT the security boundary: every admin page and action still calls `requireAdmin()` (ADR-010).
 */
export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === '/admin/login'
  const hasDirectSession = request.cookies.has('zorko-admin-session')

  if (hasDirectSession) {
    if (isLogin) {
      // If already signed in, redirect to /admin or requested next path
      const next = request.nextUrl.searchParams.get('next') || '/admin'
      return NextResponse.redirect(new URL(next, request.url))
    }
    const response = NextResponse.next({ request })
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  const url = raw && URL.canParse(raw) ? new URL(raw).origin : undefined
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return isLogin ? NextResponse.next() : toLogin(request, false)

  let response = NextResponse.next({ request })
  try {
    const supabase = createServerClient(url, key, {
      cookieOptions: {
        httpOnly: true,
        secure: (process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://'),
        sameSite: 'lax',
        path: '/',
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet, headers) => {
          for (const { name, value } of toSet) request.cookies.set(name, value)
          response = NextResponse.next({ request })
          for (const { name, value, options } of toSet) response.cookies.set(name, value, options)
          for (const [k, v] of Object.entries(headers ?? {})) response.headers.set(k, v)
        },
      },
    })

    const { data } = await supabase.auth.getClaims()
    const signedIn = Boolean(data?.claims?.sub)

    if (!signedIn && !isLogin) {
      const hadSession = request.cookies.getAll().some((c) => /^sb-.+-auth-token/.test(c.name))
      return withCookies(toLogin(request, hadSession), response)
    }
  } catch {
    if (!isLogin) return toLogin(request, false)
  }

  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

function toLogin(request: NextRequest, expired: boolean) {
  const target = new URL('/admin/login', request.url)
  target.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
  if (expired) target.searchParams.set('expired', '1')
  return NextResponse.redirect(target)
}

/** Keep any refreshed/cleared auth cookies when returning a different response. */
function withCookies(target: NextResponse, source: NextResponse) {
  for (const c of source.cookies.getAll()) target.cookies.set(c)
  return target
}

export const config = { matcher: ['/admin', '/admin/:path*'] }
