import { CheckCircle2, Clock, Trash2, XCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Button } from '@/components/ui/button'
import {
  approveFeedbackAction,
  deleteFeedbackAction,
  rejectFeedbackAction,
} from '@/features/feedback/actions'
import { formatDateIST } from '@/lib/format'
import { requireAdmin } from '@/server/auth/admin'
import { getDb } from '@/server/db'

export const metadata: Metadata = { title: 'Feedback Moderation' }

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await connection()
  await requireAdmin('/admin/feedback')
  const { status: filterStatus } = await searchParams

  const db = getDb()
  const [allFeedback, counts] = await Promise.all([
    db.feedback.findMany({
      where: filterStatus ? { status: filterStatus as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { moderatedBy: { select: { displayName: true, email: true } } },
    }),
    db.feedback.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ])

  const countMap = {
    PENDING: counts.find((c) => c.status === 'PENDING')?._count._all ?? 0,
    APPROVED: counts.find((c) => c.status === 'APPROVED')?._count._all ?? 0,
    REJECTED: counts.find((c) => c.status === 'REJECTED')?._count._all ?? 0,
    ALL: counts.reduce((sum, c) => sum + c._count._all, 0),
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-lg-mobile md:text-headline-lg">Customer Feedback</h1>
        <p className="text-body-md text-on-surface-variant">
          Moderate customer reviews submitted through the website. Approved reviews are displayed
          publicly on the feedback page and homepage.
        </p>
      </header>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-space-md sm:grid-cols-4">
        <a
          href="/admin/feedback"
          className={`flex flex-col gap-1 rounded-2xl p-space-md shadow-sm transition-all ${
            !filterStatus
              ? 'bg-primary text-white shadow-md'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <span className="text-label-sm font-semibold opacity-80">All Messages</span>
          <span className="font-heading text-headline-md">{countMap.ALL}</span>
        </a>
        <a
          href="/admin/feedback?status=PENDING"
          className={`flex flex-col gap-1 rounded-2xl p-space-md shadow-sm transition-all ${
            filterStatus === 'PENDING'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <span className="text-label-sm font-semibold opacity-80">Pending Review</span>
          <span className="font-heading text-headline-md">{countMap.PENDING}</span>
        </a>
        <a
          href="/admin/feedback?status=APPROVED"
          className={`flex flex-col gap-1 rounded-2xl p-space-md shadow-sm transition-all ${
            filterStatus === 'APPROVED'
              ? 'bg-tertiary text-white shadow-md'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <span className="text-label-sm font-semibold opacity-80">Approved (Live)</span>
          <span className="font-heading text-headline-md">{countMap.APPROVED}</span>
        </a>
        <a
          href="/admin/feedback?status=REJECTED"
          className={`flex flex-col gap-1 rounded-2xl p-space-md shadow-sm transition-all ${
            filterStatus === 'REJECTED'
              ? 'bg-error text-white shadow-md'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <span className="text-label-sm font-semibold opacity-80">Rejected</span>
          <span className="font-heading text-headline-md">{countMap.REJECTED}</span>
        </a>
      </div>

      {/* ── Feedback List ── */}
      {allFeedback.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-surface-container bg-surface-container-low p-space-2xl text-center">
          <Clock className="size-10 text-on-surface-variant opacity-40" />
          <p className="font-heading text-headline-sm text-on-surface">No feedback found</p>
          <p className="text-body-md text-on-surface-variant">
            {filterStatus ? `There are no ${filterStatus.toLowerCase()} messages.` : 'No customer feedback has been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          {allFeedback.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-space-md rounded-2xl border border-surface-container-high bg-surface-container-lowest p-space-lg shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container pb-space-sm">
                <div className="flex items-center gap-3">
                  <span className="font-heading font-bold text-on-surface">
                    {item.displayName || 'Anonymous Guest'}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-label-xs font-bold uppercase tracking-wider ${
                      item.status === 'APPROVED'
                        ? 'bg-tertiary/10 text-tertiary'
                        : item.status === 'REJECTED'
                          ? 'bg-error/10 text-error'
                          : 'bg-amber-500/10 text-amber-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <span className="text-body-xs text-on-surface-variant">
                  {formatDateIST(item.createdAt)}
                </span>
              </div>

              <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                {item.message}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-space-xs">
                <div className="text-body-xs text-on-surface-variant">
                  {item.moderatedAt && (
                    <span>
                      Moderated on {formatDateIST(item.moderatedAt)}
                      {item.moderatedBy && ` by ${item.moderatedBy.displayName || item.moderatedBy.email}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.status !== 'APPROVED' && (
                    <form
                      action={async () => {
                        'use server'
                        await approveFeedbackAction(item.id)
                      }}
                    >
                      <Button type="submit" size="sm" variant="primary" className="gap-1.5 bg-tertiary hover:bg-tertiary-container">
                        <CheckCircle2 className="size-4" />
                        Approve
                      </Button>
                    </form>
                  )}

                  {item.status !== 'REJECTED' && (
                    <form
                      action={async () => {
                        'use server'
                        await rejectFeedbackAction(item.id)
                      }}
                    >
                      <Button type="submit" size="sm" variant="secondary" className="gap-1.5 text-error hover:bg-error/10">
                        <XCircle className="size-4" />
                        Reject
                      </Button>
                    </form>
                  )}

                  <form
                    action={async () => {
                      'use server'
                      await deleteFeedbackAction(item.id)
                    }}
                  >
                    <Button type="submit" size="sm" variant="secondary" className="gap-1 text-on-surface-variant hover:text-error">
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

