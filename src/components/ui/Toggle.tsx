'use client'

import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  id?: string
}

export default function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 transition-colors duration-300 ease-luxury focus:outline-none focus-visible:ring-1 focus-visible:ring-charcoal focus-visible:ring-offset-2',
          checked ? 'bg-charcoal' : 'bg-pale-gray'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 bg-white transition-transform duration-300 ease-luxury',
            checked && 'translate-x-4'
          )}
        />
      </button>
      {label && (
        <span className="font-body text-[13px] text-dark-gray select-none">
          {label}
        </span>
      )}
    </label>
  )
}
