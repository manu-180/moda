import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-32" /></div>
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  )
}
