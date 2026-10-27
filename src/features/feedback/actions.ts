'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { recordAudit } from '@/server/audit'
import { requireAdmin } from '@/server/auth/admin'
import { getDb } from '@/server/db'

const feedbackSubmissionSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(40, 'Name must be 40 characters or fewer')
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  message: z
    .string()
    .trim()
    .min(5, 'Feedback must be at least 5 characters')
    .max(1000, 'Feedback must be 1000 characters or fewer'),
})

export type FeedbackFormState = {
  success?: boolean
  error?: string
  fieldErrors?: {
    displayName?: string[]
    message?: string[]
  }
}

/** Public guest submission */
export async function submitFeedbackAction(
  _prev: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const raw = {
    displayName: formData.get('displayName'),
    message: formData.get('message'),
  }

  const parsed = feedbackSubmissionSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const db = getDb()
    await db.feedback.create({
      data: {
        displayName: parsed.data.displayName,
        message: parsed.data.message,
        status: 'PENDING',
        isDemo: false,
      },
    })

    revalidatePath('/feedback')
    revalidatePath('/admin')
    revalidatePath('/admin/feedback')

    return {
      success: true,
      error: undefined,
    }
  } catch (err) {
    console.error('Failed to submit feedback:', err)
    return {
      success: false,
      error: 'Unable to submit feedback at the moment. Please try again later.',
    }
  }
}

/** Admin: approve feedback */
export async function approveFeedbackAction(feedbackId: string) {
  const admin = await requireAdmin()
  const db = getDb()

  await db.feedback.update({
    where: { id: feedbackId },
    data: {
      status: 'APPROVED',
      moderatedAt: new Date(),
      moderatedById: admin.id,
    },
  })

  await recordAudit({
    adminUserId: admin.id,
    action: 'FEEDBACK_MODERATED',
    entityType: 'feedback',
    entityId: feedbackId,
    summary: 'Approved customer feedback',
  })

  revalidatePath('/feedback')
  revalidatePath('/admin')
  revalidatePath('/admin/feedback')
}

/** Admin: reject feedback */
export async function rejectFeedbackAction(feedbackId: string) {
  const admin = await requireAdmin()
  const db = getDb()

  await db.feedback.update({
    where: { id: feedbackId },
    data: {
      status: 'REJECTED',
      moderatedAt: new Date(),
      moderatedById: admin.id,
    },
  })

  await recordAudit({
    adminUserId: admin.id,
    action: 'FEEDBACK_MODERATED',
    entityType: 'feedback',
    entityId: feedbackId,
    summary: 'Rejected customer feedback',
  })

  revalidatePath('/feedback')
  revalidatePath('/admin')
  revalidatePath('/admin/feedback')
}

/** Admin: delete feedback */
export async function deleteFeedbackAction(feedbackId: string) {
  const admin = await requireAdmin()
  const db = getDb()

  await db.feedback.delete({
    where: { id: feedbackId },
  })

  await recordAudit({
    adminUserId: admin.id,
    action: 'FEEDBACK_DELETED',
    entityType: 'feedback',
    entityId: feedbackId,
    summary: 'Deleted customer feedback entry',
  })

  revalidatePath('/feedback')
  revalidatePath('/admin')
  revalidatePath('/admin/feedback')
}

