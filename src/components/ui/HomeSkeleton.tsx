import { Skeleton } from './Skeleton';

export function HomeSkeleton() {
  return (
    <div className="p-4 space-y-12 sm:p-8 lg:p-12">
      {/* Intro Section */}
      <div className="max-w-3xl mx-auto text-center space-y-6 py-8 sm:py-12">
        <Skeleton className="h-16 w-3/4 mx-auto" />
        <Skeleton className="h-24 w-full mx-auto" />
      </div>

      {/* Hero Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-1.5">
            <Skeleton className="h-1.5 w-4 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
          </div>
        </div>
        <Skeleton className="aspect-[2/3] sm:aspect-[16/9] w-full rounded-[2.5rem] sm:rounded-[3rem]" />
      </div>

      {/* Recent Spotlights */}
      <div className="flex justify-between items-end mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[280px] sm:min-w-[350px] lg:min-w-[400px] space-y-4">
            <Skeleton className="aspect-video w-full rounded-[2rem]" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
