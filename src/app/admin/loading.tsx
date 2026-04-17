import Skeleton from '@/components/ui/Skeleton'

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-[120px] rounded-lg" />))}
      </div>
      <Skeleton className="h-[360px] rounded-lg" />
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  )
}
