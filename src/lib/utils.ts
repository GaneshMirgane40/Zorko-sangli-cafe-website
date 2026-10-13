/** Joins class names, skipping falsy values. Variants are designed not to conflict, so no merging is needed. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
