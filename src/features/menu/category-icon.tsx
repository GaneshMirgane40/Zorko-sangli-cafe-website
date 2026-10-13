import {
  Coffee,
  CupSoda,
  IceCreamCone,
  Pizza,
  Popcorn,
  Sandwich,
  Soup,
  Utensils,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// UI_SPEC §9: fixed list chosen by the admin (Prisma enum CategoryIcon, ADR-039).
const ICONS: Record<string, LucideIcon> = {
  BURGER: Sandwich,
  SANDWICH: Sandwich,
  PIZZA: Pizza,
  PASTA: Soup,
  SNACKS: Popcorn,
  BEVERAGE: CupSoda,
  COFFEE: Coffee,
  DESSERT: IceCreamCone,
  MEAL: Utensils,
  GENERAL: UtensilsCrossed,
}

export function CategoryIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const Icon = ICONS[iconKey] ?? UtensilsCrossed
  return <Icon aria-hidden="true" className={cn('size-6', className)} />
}

/** Missing-image tile (UI_SPEC §10): neutral surface with a generic food icon. */
export function ImageFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex size-full items-center justify-center bg-surface-container-high text-on-surface-variant',
        className,
      )}
    >
      <UtensilsCrossed aria-hidden="true" className="size-8" />
    </div>
  )
}
