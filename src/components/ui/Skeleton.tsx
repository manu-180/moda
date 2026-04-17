import { cn } from '@/lib/utils'

const variantClasses = {
  text: 'h-4 w-full',
  image: 'aspect-[3/4] w-full',
  card: 'h-64 w-full',
  circle: 'h-10 w-10 rounded-full',
} as const

interface SkeletonProps {
  variant?: keyof typeof variantClasses
  className?: string
}

export default function Skeleton({
  variant = 'text',
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-pale-gray via-cream to-pale-gray bg-[length:200%_100%]',
        variantClasses[variant],
        className
      )}
      aria-hidden="true"
    />
  )
}
