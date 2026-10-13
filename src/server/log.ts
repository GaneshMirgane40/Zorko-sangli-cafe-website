import 'server-only'

/**
 * Structured JSON log lines (TRD §10). Callers pass only safe fields: never request bodies,
 * cookies, tokens, keys, raw IPs or full feedback text.
 */
type Level = 'info' | 'warn' | 'error'

export function log(level: Level, event: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ level, time: new Date().toISOString(), event, ...fields })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  // eslint-disable-next-line no-console -- this module IS the structured logger
  else console.info(line)
}
