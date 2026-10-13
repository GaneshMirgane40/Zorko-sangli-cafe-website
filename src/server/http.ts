import 'server-only'
import { connection } from 'next/server'
import { z } from 'zod'
import { log } from './log'

/**
 * Consistent JSON responses and safe error mapping for Route Handlers (TRD §6–7).
 * Success: { data, meta? }. Error: { error: { code, message, fields? } }.
 * Responses never contain stack traces, SQL, Prisma messages or environment details.
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'BAD_ORIGIN'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL'

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  RATE_LIMITED: 429,
  PAYLOAD_TOO_LARGE: 413,
  BAD_ORIGIN: 403,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL: 500,
}

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
  get status() {
    return STATUS[this.code]
  }
}

export type PageMeta = { page: number; pageSize: number; total: number; totalPages: number }

const NO_STORE = { 'Cache-Control': 'no-store' }

export function ok<T>(data: T, meta?: PageMeta, status = 200): Response {
  return Response.json(meta ? { data, meta } : { data }, { status, headers: NO_STORE })
}

export function fail(error: ApiError, headers: HeadersInit = {}): Response {
  const body = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.fields ? { fields: error.fields } : {}),
    },
  }
  return Response.json(body, { status: error.status, headers: { ...NO_STORE, ...headers } })
}

/** Zod issues → { "field.path": "first message" } (only the first message per field). */
export function zodFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    fields[key] ??= issue.message
  }
  return fields
}

/** Prisma errors are recognised by their stable `code` so this module does not import Prisma. */
function prismaCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: unknown }).code
    if (typeof code === 'string' && /^P\d{4}$/.test(code)) return code
  }
  return undefined
}

function isDbUnavailable(err: unknown): boolean {
  const name = (err as { name?: string } | null)?.name ?? ''
  const code = prismaCode(err)
  return (
    name === 'PrismaClientInitializationError' ||
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P2024' ||
    name === 'DriverAdapterError'
  )
}

/** Maps any thrown value to a safe ApiError (TRD §7). Unknown errors become INTERNAL. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (err instanceof z.ZodError) {
    return new ApiError('VALIDATION_ERROR', 'Some values are invalid.', zodFields(err))
  }
  const code = prismaCode(err)
  if (code === 'P2002') return new ApiError('CONFLICT', 'A record with this value already exists.')
  if (code === 'P2025') return new ApiError('NOT_FOUND', 'Not found.')
  if (code === 'P2003') return new ApiError('CONFLICT', 'This record is in use.')
  if (isDbUnavailable(err)) {
    return new ApiError('SERVICE_UNAVAILABLE', 'The service is temporarily unavailable. Try again.')
  }
  return new ApiError('INTERNAL', 'Something went wrong.')
}

type Handler<C> = (request: Request, context: C) => Promise<Response>

/**
 * Wraps a Route Handler: opts out of build-time prerendering (data must be fresh — FR live
 * availability), adds a request id, maps errors safely and logs only non-sensitive fields.
 */
export function apiRoute<C>(route: string, handler: Handler<C>): Handler<C> {
  return async (request, context) => {
    await connection()
    const requestId = crypto.randomUUID()
    const started = Date.now()
    try {
      const response = await handler(request, context)
      response.headers.set('X-Request-Id', requestId)
      return response
    } catch (err) {
      const apiError = toApiError(err)
      if (apiError.status >= 500) {
        // Log the error class only; messages from drivers can contain connection details.
        log('error', 'api.error', {
          requestId,
          route,
          code: apiError.code,
          errorName: (err as { name?: string } | null)?.name ?? typeof err,
          prismaCode: prismaCode(err),
          durationMs: Date.now() - started,
        })
      }
      return fail(apiError, { 'X-Request-Id': requestId })
    }
  }
}

/** Parses query params with a Zod schema, throwing a VALIDATION_ERROR ApiError on failure. */
export function parseQuery<T extends z.ZodType>(request: Request, schema: T): z.infer<T> {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries())
  const result = schema.safeParse(params)
  if (!result.success) {
    throw new ApiError('VALIDATION_ERROR', 'Invalid query parameters.', zodFields(result.error))
  }
  return result.data
}
