export function SkeletonCard() {
  return (
    <article className="animate-pulse rounded-[2rem] border border-border bg-background p-5">
      <div className="flex gap-4">
        <div className="size-16 shrink-0 rounded-3xl bg-secondary/60 sm:size-20" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="w-full">
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-7 w-44 rounded-lg bg-secondary/60" />
                <div className="h-6 w-24 rounded-full bg-secondary/60" />
              </div>
              <div className="mt-2 h-4 w-48 rounded-lg bg-secondary/60" />
            </div>
            <div className="size-11 shrink-0 rounded-full bg-secondary/60" />
          </div>
          <div className="mt-4 h-4 w-full rounded-lg bg-secondary/60" />
          <div className="mt-2 h-4 w-3/4 rounded-lg bg-secondary/60" />
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="h-7 w-20 rounded-full bg-secondary/60" />
            <div className="h-7 w-24 rounded-full bg-secondary/60" />
            <div className="h-7 w-16 rounded-full bg-secondary/60" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="h-5 w-36 rounded-lg bg-secondary/60" />
            <div className="h-5 w-28 rounded-lg bg-secondary/60" />
            <div className="h-5 w-32 rounded-lg bg-secondary/60" />
            <div className="h-5 w-40 rounded-lg bg-secondary/60" />
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="h-3 w-16 rounded-lg bg-secondary/60" />
              <div className="mt-1 h-7 w-24 rounded-lg bg-secondary/60" />
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-32 rounded-full bg-secondary/60" />
              <div className="h-12 w-28 rounded-full bg-secondary/60" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}