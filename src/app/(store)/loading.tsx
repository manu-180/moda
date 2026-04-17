import Skeleton from '@/components/ui/Skeleton'

export default function HomeLoading() {
  return (
    <div>
      <Skeleton className="h-screen w-full" />
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 py-20">
        <Skeleton className="h-6 w-48 mx-auto mb-16" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}><Skeleton variant="image" /><Skeleton className="h-4 w-3/4 mt-3" /><Skeleton className="h-4 w-1/3 mt-2" /></div>
          ))}
        </div>
      </div>
    </div>
  )
}
