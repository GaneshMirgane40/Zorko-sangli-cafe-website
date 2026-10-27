import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Page container: fluid responsive layout, adapts cleanly on zoom in/out up to 1480px. */
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1480px] px-4 sm:px-6 md:px-8 lg:px-10',
        className,
      )}
      {...props}
    />
  )
}
