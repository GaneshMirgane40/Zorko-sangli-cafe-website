'use client' // Error boundaries must be Client Components.

import { Container } from '@/components/ui/container'
import { ErrorState } from '@/components/ui/states'

// Segment error boundary (UI_SPEC §7.7). Never shows technical details: in production Next.js
// replaces Server Component error messages with a generic message plus `digest`.
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main id="main" className="flex flex-1 items-center py-space-2xl">
      <Container>
        <ErrorState
          title="Something went wrong"
          description="We couldn't load this page. Please try again."
          onRetry={() => retry()}
          reference={error.digest}
        />
      </Container>
    </main>
  )
}
