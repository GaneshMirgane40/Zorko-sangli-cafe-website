import Link from 'next/link'

/** Text wordmark (UI_SPEC §8.1). The official logo is used only once permission is confirmed (Q-09). */
export function Logo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-space-sm rounded-xl"
      aria-label="ZORKO Sangli — home"
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-xl bg-primary font-heading text-headline-sm font-extrabold text-on-primary"
      >
        Z
      </span>
      <span aria-hidden="true" className="flex flex-col leading-none">
        <span className="font-heading text-headline-sm font-extrabold">ZORKO</span>
        <span className="text-label-sm tracking-widest text-primary uppercase">Sangli</span>
      </span>
    </Link>
  )
}
