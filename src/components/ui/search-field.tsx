'use client'

import { Search, X } from 'lucide-react'
import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

type SearchFieldProps = {
  name?: string
  label: string
  placeholder?: string
  defaultValue?: string
  maxLength?: number
  className?: string
  inputId?: string
  /** Called after every edit (including Clear), e.g. to debounce a search. */
  onValueChange?: (value: string) => void
}

/**
 * Search input (UI_SPEC §7.2) for use inside a GET <form>, so it works without JavaScript.
 * The clear button appears only when there is text.
 */
export function SearchField({
  name = 'q',
  label,
  placeholder,
  defaultValue = '',
  maxLength = 60,
  className,
  inputId,
  onValueChange,
}: SearchFieldProps) {
  const autoId = useId()
  const id = inputId ?? autoId
  const [value, setValue] = useState(defaultValue)
  return (
    <div className={cn('relative flex items-center', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-space-md size-[18px] text-on-surface-variant"
      />
      <input
        id={id}
        type="search"
        name={name}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          setValue(event.target.value)
          onValueChange?.(event.target.value)
        }}
        className="h-12 w-full rounded-xl bg-surface-canvas-subtle pr-12 pl-11 text-body-md text-on-surface placeholder:text-on-surface-variant focus:bg-white focus:outline-none focus-visible:ring-[1.5px] focus-visible:ring-primary [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue('')
            onValueChange?.('')
          }}
          className="absolute right-0 inline-flex size-12 items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface"
        >
          <X aria-hidden="true" className="size-[18px]" />
        </button>
      )}
    </div>
  )
}
