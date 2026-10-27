import { HeartHandshake, MessageSquareQuote, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Container } from '@/components/ui/container'
import { FeedbackForm } from '@/features/feedback/feedback-form'
import { formatDateIST } from '@/lib/format'
import { pageMetadata } from '@/lib/site/seo'
import { getDb } from '@/server/db'

export const metadata: Metadata = pageMetadata({
  title: 'Guest Feedback',
  description: 'Share your experience at ZORKO Sangli. We read every guest review.',
  path: '/feedback',
})

async function getApprovedReviews() {
  await connection()
  try {
    const db = getDb()
    return await db.feedback.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        displayName: true,
        message: true,
        createdAt: true,
      },
    })
  } catch (err) {
    console.error('Failed to load approved feedback:', err)
    return []
  }
}

export default async function FeedbackPage() {
  const reviews = await getApprovedReviews()

  return (
    <main id="main" className="flex-1">
      {/* ── Page Header ── */}
      <div className="bg-surface-warm-cream">
        <Container className="flex flex-col gap-1 py-space-lg">
          <h1 className="text-headline-lg-mobile md:text-headline-lg">Guest Feedback</h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Have thoughts on your food, our service, or the vibe? We love hearing from our guests!
            Your review helps us keep serving happiness with every bite.
          </p>
        </Container>
      </div>

      <Container className="py-space-xl">
        <div className="grid gap-space-xl lg:grid-cols-12">
          {/* ── Form Column (Left 7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <FeedbackForm />
          </div>

          {/* ── Community Reviews Column (Right 5 cols) ── */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="size-5 text-primary" />
              <h2 className="font-heading text-headline-sm text-on-surface">Guest Highlights</h2>
            </div>

            {reviews.length > 0 ? (
              <div className="flex flex-col gap-space-md">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col gap-2 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-space-md shadow-sm"
                  >
                    <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                      &ldquo;{r.message}&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-body-xs text-on-surface-variant border-t border-surface-container pt-2">
                      <span className="font-bold text-on-surface">
                        {r.displayName || 'Café Guest'}
                      </span>
                      <span>{formatDateIST(r.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-surface-container bg-surface-container-low p-space-xl text-center">
                <HeartHandshake className="size-10 text-primary opacity-60" />
                <div>
                  <h3 className="font-heading text-headline-sm text-on-surface">Be the First!</h3>
                  <p className="mt-1 text-body-sm text-on-surface-variant max-w-xs">
                    Drop your feedback using the form on the left. Approved guest shoutouts will
                    be featured right here!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  )
}

