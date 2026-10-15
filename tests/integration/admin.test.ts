import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { checkAllowlist } from '@/server/auth/admin'
import { recordAudit } from '@/server/audit'
import { RULES, hitRateLimit } from '@/server/rate-limit'
import { getDashboardStats, listRecentAudit } from '@/server/services/dashboard'
import { db } from './helpers'

const activeId = randomUUID()
const inactiveId = randomUUID()

beforeAll(async () => {
  await db().adminUser.createMany({
    data: [
      { authUserId: activeId, email: 'active-admin@test.invalid', isActive: true },
      { authUserId: inactiveId, email: 'inactive-admin@test.invalid', isActive: false },
    ],
  })
})
afterAll(async () => {
  await db().auditLog.deleteMany({})
  await db().adminUser.deleteMany({ where: { email: { endsWith: '@test.invalid' } } })
  await db().rateLimitBucket.deleteMany({})
})

describe('authorization matrix (TC-SEC-001…004, ADR-010)', () => {
  it('anonymous: no or malformed user ID', async () => {
    expect(await checkAllowlist(null)).toEqual({ status: 'anonymous' })
    expect(await checkAllowlist('')).toEqual({ status: 'anonymous' })
    expect(await checkAllowlist("' OR 1=1 --")).toEqual({ status: 'anonymous' })
  })
  it('authenticated but not allowlisted: forbidden', async () => {
    expect((await checkAllowlist(randomUUID())).status).toBe('forbidden')
  })
  it('allowlisted but disabled: forbidden', async () => {
    expect((await checkAllowlist(inactiveId)).status).toBe('forbidden')
  })
  it('active admin: allowed, returns only safe identity fields', async () => {
    const res = await checkAllowlist(activeId)
    expect(res.status).toBe('admin')
    if (res.status === 'admin')
      expect(Object.keys(res.admin).sort()).toEqual(['displayName', 'email', 'id'])
  })
  it('role escalation: the decision depends only on the allowlist row, not on any token claim', async () => {
    // checkAllowlist takes the verified user ID only; claims such as role=admin in
    // user_metadata/app_metadata cannot be passed in and are never read.
    expect(checkAllowlist.length).toBe(1)
    expect((await checkAllowlist(randomUUID())).status).toBe('forbidden')
  })
})

describe('login rate limiting (TC-SEC-050, ADR-014)', () => {
  it('allows 5 attempts per account per window, refuses the 6th, resets next window', async () => {
    const now = new Date('2026-10-15T10:00:00Z')
    const results = []
    for (let i = 0; i < 6; i++)
      results.push(await hitRateLimit(RULES.loginPerAccount, ['198.51.100.7', 'a@b.c'], now))
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, true, true, false])
    expect(results[5].retryAfterSec).toBeGreaterThan(0)
    const later = new Date(now.getTime() + RULES.loginPerAccount.windowMs)
    expect(
      (await hitRateLimit(RULES.loginPerAccount, ['198.51.100.7', 'a@b.c'], later)).allowed,
    ).toBe(true)
    // A different account from the same IP has its own counter.
    expect(
      (await hitRateLimit(RULES.loginPerAccount, ['198.51.100.7', 'x@y.z'], now)).allowed,
    ).toBe(true)
  })
  it('stores only HMAC keys, never raw IPs or emails', async () => {
    const rows = await db().rateLimitBucket.findMany({ select: { key: true } })
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) {
      expect(r.key).toMatch(/^[0-9a-f]{64}$/)
      expect(r.key).not.toContain('198.51')
    }
  })
  it('concurrent attempts are counted atomically', async () => {
    const now = new Date('2026-10-15T12:00:00Z')
    const all = await Promise.all(
      Array.from({ length: 10 }, () =>
        hitRateLimit(RULES.loginPerAccount, ['192.0.2.1', 'p@q.r'], now),
      ),
    )
    expect(all.filter((r) => r.allowed)).toHaveLength(5)
  })
})

describe('audit log and dashboard (TC-INT-060, TC-INT-061)', () => {
  it('records actions with a trimmed, length-capped summary and the admin name', async () => {
    const admin = await db().adminUser.findUniqueOrThrow({ where: { authUserId: activeId } })
    await recordAudit({
      adminUserId: admin.id,
      action: 'LOGIN',
      entityType: 'session',
      summary: `  Signed\n in ${'x'.repeat(400)}`,
    })
    const [latest] = await listRecentAudit(1)
    expect(latest.action).toBe('LOGIN')
    expect(latest.adminName).toBe('active-admin@test.invalid')
    expect(latest.summary.startsWith('Signed in x')).toBe(true)
    expect(latest.summary.length).toBe(300)
  })
  it('dashboard counts are real database counts (fixtures: 16 public items)', async () => {
    const stats = await getDashboardStats()
    expect(stats.totalItems).toBe(16)
    expect(stats.availableItems + stats.unavailableItems).toBe(16)
    expect(stats.activeOffers).toBe(3)
    expect(stats.scheduledOffers).toBe(1)
    expect(stats.pendingFeedback).toBe(0)
  })
})
