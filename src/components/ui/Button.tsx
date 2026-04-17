'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-charcoal text-white hover:bg-[#333333] disabled:bg-warm-gray',
  secondary:
    'border border-charcoal text-charcoal hover:bg-charcoal hover:text-white disabled:border-warm-gray disabled:text-warm-gray',
  ghost:
    'text-charcoal hover:bg-cream disabled:text-warm-gray',
  danger:
    'bg-muted-red text-white hover:bg-[#7A1526] disabled:bg-warm-gray',
} as const

const sizes = {
  sm: 'px-5 py-2 text-[11px]',
  md: 'px-7 py-3 text-[12px]',
  lg: 'px-10 py-4 text-[13px]',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center font-body uppercase tracking-[0.12em] font-medium',
          'transition-all duration-[400ms] ease-luxury',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-charcoal focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </span>
        )}
        <span className={cn(loading && 'invisible')}>{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
