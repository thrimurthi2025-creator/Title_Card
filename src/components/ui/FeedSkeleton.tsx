import { Skeleton } from './Skeleton';

export function FeedSkeleton() {
  return (
    <div className="p-4 space-y-8">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 border-2 border-foreground shadow-pop space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>

            {/* Image */}
            <Skeleton className="aspect-[16/9] w-full rounded-lg" />

            {/* Details */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
