import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-pale-gray text-dark-gray',
  new: 'bg-charcoal text-white',
  sale: 'bg-muted-red text-white',
  success: 'bg-deep-forest text-white',
  warning: 'bg-champagne text-charcoal',
} as const

interface BadgeProps {
  variant?: keyof typeof variants
  children: React.ReactNode
  className?: string
}

export default function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.1em] font-medium leading-none',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
