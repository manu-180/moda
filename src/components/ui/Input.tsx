'use client'

import { forwardRef, type InputHTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', id, onFocus, onBlur, value, defaultValue, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const hasValue = value !== undefined ? String(value).length > 0 : false
    const isActive = focused || hasValue || !!defaultValue

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'absolute left-0 font-body transition-all duration-300 ease-luxury pointer-events-none',
              isActive
                ? 'top-0 text-[10px] uppercase tracking-[0.1em] text-warm-gray'
                : 'top-3 text-[14px] text-warm-gray'
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          className={cn(
            'w-full bg-transparent pb-2 pt-5 font-body text-[14px] text-charcoal',
            'border-b transition-colors duration-300 ease-luxury',
            'focus:outline-none',
            error
              ? 'border-muted-red'
              : focused
                ? 'border-charcoal'
                : 'border-pale-gray',
            !label && 'pt-2',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${id}-error`}
            className="mt-1.5 font-body text-[12px] text-muted-red"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
