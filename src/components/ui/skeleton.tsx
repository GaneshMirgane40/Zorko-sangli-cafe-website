import { cn } from '@/lib/utils'

/** Loading placeholder; pulse is disabled under reduced motion (UI_SPEC §7.7). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-xl bg-surface-container-high motion-safe:animate-pulse', className)}
    />
  )
}

/** Skeleton matching the menu card shape. */
export function MenuCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-space-sm rounded-2xl bg-surface-container-lowest p-space-md shadow-sm"
    >
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="mt-space-sm flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </div>
  )
}
