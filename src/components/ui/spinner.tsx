import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Decorative spinner; the owning control carries aria-busy / status text. */
export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle aria-hidden="true" className={cn('size-4 motion-safe:animate-spin', className)} />
  )
}
