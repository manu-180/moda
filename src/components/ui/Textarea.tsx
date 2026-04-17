'use client'

import { forwardRef, type TextareaHTMLAttributes, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  autoResize?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, autoResize = false, id, onFocus, onBlur, onChange, value, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const hasValue = value !== undefined ? String(value).length > 0 : false
    const isActive = focused || hasValue
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      }
    }, [value, autoResize, textareaRef])

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
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          onChange={(e) => {
            onChange?.(e)
            if (autoResize && textareaRef.current) {
              textareaRef.current.style.height = 'auto'
              textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
            }
          }}
          className={cn(
            'w-full bg-transparent pb-2 pt-5 font-body text-[14px] text-charcoal resize-none',
            'border-b transition-colors duration-300 ease-luxury',
            'focus:outline-none',
            error
              ? 'border-muted-red'
              : focused
                ? 'border-charcoal'
                : 'border-pale-gray',
            !label && 'pt-2',
            !autoResize && 'min-h-[100px]',
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

Textarea.displayName = 'Textarea'
export default Textarea
