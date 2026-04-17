import Skeleton from '@/components/ui/Skeleton'

export default function ProductsLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-20 py-12">
      <Skeleton className="h-4 w-32 mb-6" />
      <Skeleton className="h-10 w-64 mb-14" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}><Skeleton variant="image" /><div className="mt-3 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/3" /></div></div>
        ))}
      </div>
    </div>
  )
}
