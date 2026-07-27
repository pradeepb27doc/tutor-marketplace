export function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="size-9 animate-pulse rounded-full bg-secondary" />
            <div className="h-4 w-36 animate-pulse rounded-full bg-secondary" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-full bg-secondary" />
        </nav>
      </header>

      {/* Hero skeleton */}
      <section className="border-b border-border bg-secondary/30 px-5 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 h-4 w-48 animate-pulse rounded-full bg-secondary" />

          <div className="grid gap-8 rounded-[2.5rem] border border-border bg-background p-5 lg:grid-cols-[1fr_22rem] lg:p-8">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="size-28 animate-pulse rounded-[2rem] bg-secondary sm:size-36" />
              <div className="min-w-0 flex-1 space-y-4">
                <div className="h-5 w-40 animate-pulse rounded-full bg-secondary" />
                <div className="h-10 w-72 animate-pulse rounded-full bg-secondary" />
                <div className="h-6 w-96 animate-pulse rounded-full bg-secondary" />
                <div className="h-8 w-full max-w-xl animate-pulse rounded-full bg-secondary" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-secondary" />
                  ))}
                </div>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-3xl bg-secondary" />
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[28rem] animate-pulse rounded-[2rem] bg-secondary/35" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="px-5 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_23rem]">
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-[2rem] border border-border bg-background" />
            ))}
          </div>
          <div className="h-[40rem] animate-pulse rounded-[2rem] border border-border bg-background" />
        </div>
      </section>
    </main>
  );
}