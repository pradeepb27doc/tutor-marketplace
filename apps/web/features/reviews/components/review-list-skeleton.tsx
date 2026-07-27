export interface ReviewListSkeletonProps {
  count?: number;
}

export function ReviewListSkeleton({ count = 3 }: ReviewListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-background p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className="size-4 animate-pulse rounded bg-foreground/10"
                />
              ))}
            </div>
            <div className="h-3 w-24 animate-pulse rounded bg-foreground/10" />
          </div>
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-foreground/10" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-foreground/10" />
          <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-foreground/10" />
        </div>
      ))}
    </div>
  );
}