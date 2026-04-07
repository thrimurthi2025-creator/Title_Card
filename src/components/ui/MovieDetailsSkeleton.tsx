import { Skeleton } from './Skeleton';

export function MovieDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B0914] text-white pb-24">
      <div className="relative aspect-[16/9] w-full bg-black">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="px-6 -mt-16 relative z-10 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        <div className="bg-[#1A1525] p-6 rounded-[2rem] border border-white/5 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="bg-[#1A1525] p-6 rounded-[2rem] border border-white/5 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
