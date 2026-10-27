import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  showTag?: boolean
  priority?: boolean
}

/** Official ZORKO Brand Logo with Sangli outlet tag. */
export function Logo({ className = '', showTag = true, priority = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group flex shrink-0 items-center gap-space-xs rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      aria-label="ZORKO Sangli — home"
    >
      <Image
        src="/logo.webp"
        alt="ZORKO — Brand of Food Lovers"
        width={118}
        height={50}
        priority={priority}
        className="h-10 w-auto object-contain transition-transform group-hover:scale-105 md:h-12"
      />
      {showTag && (
        <span
          aria-hidden="true"
          className="rounded-full bg-primary/10 px-2 py-0.5 font-heading text-[11px] font-bold tracking-wider text-primary uppercase transition-colors group-hover:bg-primary/15"
        >
          Sangli
        </span>
      )}
    </Link>
  )
}
