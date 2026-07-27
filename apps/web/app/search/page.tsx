"use client";

import {
  BookOpen,
  Clock3,
  Filter,
  Loader2,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearch } from "../../features/search/hooks/use-search";
import { SkeletonCard } from "../../features/search/components/skeleton-card";
import { EmptyState } from "../../features/search/components/empty-state";
import { ErrorState } from "../../features/search/components/error-state";
import { TutorCard } from "../../features/search/components/tutor-card";
import { FilterPanel } from "../../features/search/components/filter-panel";
import { SearchBar } from "../../features/search/components/search-bar";
import { SORT_OPTIONS, SKELETON_COUNT } from "../../features/search/constants";
import type { TutorSortKey } from "../../features/search/types";

export default function SearchPage() {
  const {
    tutors,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    sort,
    setSort,
    loadMore,
    retry,
    clearFilters,
  } = useSearch();

  const [subjectInput, setSubjectInput] = useState("");
  const [boardInput, setBoardInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleSortChange = useCallback(
    (newSort: TutorSortKey) => {
      setSort(newSort);
    },
    [setSort],
  );

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // The debounced values will trigger the search automatically
  }, []);

  const handleRetry = useCallback(() => {
    retry();
  }, [retry]);

  const handleClearFilters = useCallback(() => {
    setSubjectInput("");
    setBoardInput("");
    setLocationInput("");
    clearFilters();
  }, [clearFilters]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Search Section */}
      <section className="border-b border-border bg-secondary/30 px-5 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
              <Sparkles className="size-3.5" aria-hidden="true" /> Premium Tutor Network
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Find your perfect tutor
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-7 text-foreground/58">
              Browse top-rated, verified educators. Filter by subject, board, budget, and availability.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <SearchBar
              subjectInput={subjectInput}
              boardInput={boardInput}
              locationInput={locationInput}
              onSubjectChange={setSubjectInput}
              onBoardChange={setBoardInput}
              onLocationChange={setLocationInput}
              onSubmit={handleSearchSubmit}
            />
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="px-5 py-8 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[19rem_1fr]">
          <FilterPanel />

          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/42">
                  Search results
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">
                  {isLoading
                    ? "Searching tutors..."
                    : `${tutors.length} premium tutor${tutors.length !== 1 ? "s" : ""} available`}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <details className="group relative lg:hidden">
                  <summary className="inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold shadow-[0_12px_40px_rgba(15,23,42,0.07)]">
                    <Filter className="size-4" aria-hidden="true" /> Filters
                  </summary>
                  <div className="absolute right-0 z-30 mt-3 w-[min(92vw,24rem)]">
                    <FilterPanel variant="mobile" />
                  </div>
                </details>

                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value as TutorSortKey)}
                  className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold outline-none transition-colors hover:bg-secondary"
                  aria-label="Sort tutors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <ErrorState message={error} onRetry={handleRetry} />
            ) : isLoading ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : tutors.length === 0 ? (
              <EmptyState onClearFilters={handleClearFilters} />
            ) : (
              <>
                <div className="grid gap-5 xl:grid-cols-2">
                  {tutors.map((tutor) => (
                    <TutorCard key={tutor.id} tutor={tutor} />
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="mt-8 flex justify-center">
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground/60">
                      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                      Loading more tutors...
                    </div>
                  )}
                  {!hasMore && tutors.length > 0 && (
                    <p className="text-sm font-medium text-foreground/40">
                      All tutors loaded
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-5 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-border bg-secondary/35 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              [Video, "Online lessons", "Live, flexible sessions"],
              [UsersRound, "Offline options", "Nearby tutor discovery"],
              [Clock3, "Fast availability", "Slots from today"],
              [BookOpen, "Board aligned", "CBSE, ICSE, IB and more"],
            ] as const
          ).map(([Icon, title, description]) => (
            <div key={title} className="rounded-3xl bg-background p-5">
              <Icon className="size-5 text-foreground" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{title}</h3>
              <p className="mt-2 text-sm text-foreground/52">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}