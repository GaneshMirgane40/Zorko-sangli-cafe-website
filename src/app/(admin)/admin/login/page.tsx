import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Logo } from '@/components/layout/logo'
import { Skeleton } from '@/components/ui/skeleton'
import { LoginForm } from '@/features/admin/login-form'
import { safeAdminNext } from '@/lib/auth/redirect'
import { NO_INDEX } from '@/lib/site/seo'

export const metadata: Metadata = { title: 'Admin sign in', robots: NO_INDEX }

const NOTICES: Record<string, string> = {
  expired: 'Your session expired. Please sign in again.',
  signedOut: 'You have been signed out.',
  forbidden: 'This account is not allowed to use the admin area.',
}

/**
 * Admin login (UI_SPEC §13). No signup or "forgot password": public signup is disabled in
 * Supabase and recovery goes through the Supabase dashboard (DEPLOYMENT.md §6).
 */
export default function AdminLoginPage({ searchParams }: PageProps<'/admin/login'>) {
  return (
    <main
      id="main"
      className="flex flex-1 items-center justify-center bg-surface-container-low p-space-md"
    >
      <div className="w-full max-w-sm rounded-3xl bg-surface-container-lowest p-space-xl shadow-xl">
        <div className="mb-space-lg flex flex-col items-center gap-space-sm text-center">
          <Logo />
          <h1 className="text-headline-md">Admin sign in</h1>
        </div>
        <Suspense
          fallback={
            <div className="flex flex-col gap-space-md" aria-busy="true">
              <span className="sr-only" role="status">
                Loading…
              </span>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-12 rounded-full" />
            </div>
          }
        >
          <LoginWithParams searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}

async function LoginWithParams({ searchParams }: Pick<PageProps<'/admin/login'>, 'searchParams'>) {
  const p = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const notice =
    (one(p.expired) && NOTICES.expired) ||
    (one(p.signedOut) && NOTICES.signedOut) ||
    (one(p.error) === 'forbidden' && NOTICES.forbidden) ||
    null
  return <LoginForm next={safeAdminNext(one(p.next))} notice={notice} />
}
