import { Container } from '@/components/ui/container'
import { MenuCardSkeleton, Skeleton } from '@/components/ui/skeleton'

/** Loading state for the menu (UI_SPEC §7.7): skeletons shaped like the real layout. */
export function MenuResultsSkeleton() {
  return (
    <Container
      className="grid gap-space-lg py-space-lg lg:grid-cols-12 lg:py-space-xl"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Loading menu…
      </span>
      <div className="hidden flex-col gap-space-md lg:col-span-3 lg:flex">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="flex flex-col gap-space-md lg:col-span-9">
        <Skeleton className="h-16 rounded-2xl" />
        <div className="grid grid-cols-2 gap-space-sm md:gap-space-md xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </Container>
  )
}

export function ItemDetailSkeleton() {
  return (
    <Container className="grid gap-space-lg py-space-lg lg:grid-cols-12" aria-busy="true">
      <span className="sr-only" role="status">
        Loading item…
      </span>
      <Skeleton className="aspect-[4/3] rounded-3xl lg:col-span-6" />
      <div className="flex flex-col gap-space-md lg:col-span-6">
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
    </Container>
  )
}
