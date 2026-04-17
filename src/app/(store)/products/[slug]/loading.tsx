import Skeleton from '@/components/ui/Skeleton'

export default function ProductLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-20 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-[60%]"><Skeleton variant="image" className="aspect-[3/4]" /></div>
        <div className="w-full lg:w-[40%] space-y-4">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-20 w-full mt-4" />
          <Skeleton className="h-12 w-full mt-8" />
        </div>
      </div>
    </div>
  )
}
