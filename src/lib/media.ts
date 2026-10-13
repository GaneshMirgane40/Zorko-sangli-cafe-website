/**
 * Turns a stored image path into a URL (TRD §9).
 * - `demo/…` paths are seeded placeholder files served from `public/demo/` (deterministic, local).
 * - Other paths live in the Supabase Storage public bucket (uploads arrive in Phase 5B).
 * Returns null when a path is unsafe or Storage is not configured, so the UI shows a placeholder.
 */
const DEMO_PATH = /^demo\/[a-z0-9-]+\.(webp|png|jpg)$/
const STORAGE_PATH = /^(items\/[a-z0-9]+|gallery|banners|offers)\/[a-f0-9-]{36}\.webp$/
export const STORAGE_BUCKET = 'public-media'

export function mediaUrl(
  storagePath: string | null | undefined,
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
): string | null {
  if (!storagePath) return null
  if (DEMO_PATH.test(storagePath)) return `/${storagePath}`
  if (STORAGE_PATH.test(storagePath) && supabaseUrl) {
    return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`
  }
  return null
}
