import { MenuResultsSkeleton } from '@/features/menu/skeletons'

export default function Loading() {
  return (
    <main id="main" className="flex-1">
      <MenuResultsSkeleton />
    </main>
  )
}
