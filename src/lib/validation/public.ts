import { z } from 'zod'

/**
 * Query/param schemas for the public read API (TRD §6). Shared with client code later (no server
 * imports here). Unknown query params are ignored; invalid values are rejected with 400.
 */

/** Empty query values (`?q=`) mean "not set". */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional())

/** Strip control characters (incl. NUL) and collapse whitespace in free text. */
export const cleanText = (value: string) =>
  value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be lowercase letters, digits and hyphens')
  .max(90)

/** Whole rupees in the query string (₹0 – ₹1,00,000); converted to paise by the service. */
const rupees = z.coerce
  .number({ message: 'must be a number' })
  .int('must be a whole number of rupees')
  .min(0)
  .max(100_000)

const flag = z.literal('1', { message: 'use 1 to enable' })

export const MENU_SORTS = ['popular', 'price_asc', 'price_desc', 'name'] as const
export const MAX_PAGE_SIZE = 48

export const menuQuerySchema = z
  .object({
    q: optional(z.string().transform(cleanText).pipe(z.string().max(60, 'max 60 characters'))),
    category: optional(slugSchema),
    minPrice: optional(rupees),
    maxPrice: optional(rupees),
    popular: optional(flag),
    offers: optional(flag),
    sort: optional(z.enum(MENU_SORTS)).transform((v) => v ?? 'popular'),
    page: optional(z.coerce.number().int().min(1).max(1000)).transform((v) => v ?? 1),
    pageSize: optional(z.coerce.number().int().min(1).max(MAX_PAGE_SIZE)).transform((v) => v ?? 12),
  })
  .refine((v) => v.minPrice === undefined || v.maxPrice === undefined || v.minPrice <= v.maxPrice, {
    path: ['minPrice'],
    message: 'must not be greater than maxPrice',
  })
  .transform((v) => ({ ...v, q: v.q || undefined }))

export type MenuQuery = z.infer<typeof menuQuerySchema>

export const offersQuerySchema = z.object({
  kind: optional(z.enum(['discount', 'combo', 'info'])),
  student: optional(flag),
})

export type OffersQuery = z.infer<typeof offersQuerySchema>

/** URLSearchParams → plain object (the last value wins for repeated keys). */
export function searchParamsToObject(params: URLSearchParams): Record<string, string> {
  return Object.fromEntries(params.entries())
}
