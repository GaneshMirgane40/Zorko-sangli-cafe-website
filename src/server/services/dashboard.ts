import 'server-only'
import { getDb } from '../db'
import { activeOfferWhere, publicItemWhere } from './visibility'

/** Real, persisted numbers only (CLAUDE.md §4.2): no revenue, orders, visitors or charts. */
export type DashboardStats = {
  totalItems: number
  availableItems: number
  unavailableItems: number
  activeOffers: number
  scheduledOffers: number
  pendingFeedback: number
  publishedPhotos: number
}

export type AuditEntryDto = {
  id: string
  action: string
  entityType: string
  summary: string
  adminName: string | null
  createdAt: string
}

export async function getDashboardStats(now = new Date()): Promise<DashboardStats> {
  const db = getDb()
  const [
    totalItems,
    availableItems,
    activeOffers,
    scheduledOffers,
    pendingFeedback,
    publishedPhotos,
  ] = await Promise.all([
    db.menuItem.count({ where: publicItemWhere }),
    db.menuItem.count({ where: { ...publicItemWhere, isAvailable: true } }),
    db.offer.count({ where: activeOfferWhere(now) }),
    db.offer.count({ where: { isPublished: true, expiredAt: null, startsAt: { gt: now } } }),
    db.feedback.count({ where: { status: 'PENDING' } }),
    db.galleryImage.count({ where: { isPublished: true } }),
  ])
  return {
    totalItems,
    availableItems,
    unavailableItems: totalItems - availableItems,
    activeOffers,
    scheduledOffers,
    pendingFeedback,
    publishedPhotos,
  }
}

export async function listRecentAudit(limit = 10): Promise<AuditEntryDto[]> {
  const rows = await getDb().auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      action: true,
      entityType: true,
      summary: true,
      createdAt: true,
      adminUser: { select: { displayName: true, email: true } },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    entityType: r.entityType,
    summary: r.summary,
    adminName: r.adminUser ? (r.adminUser.displayName ?? r.adminUser.email) : null,
    createdAt: r.createdAt.toISOString(),
  }))
}
