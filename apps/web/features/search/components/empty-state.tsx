import { SearchX } from "lucide-react";

interface EmptyStateProps {
  onClearFilters?: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-border bg-background px-6 py-20 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-secondary/60">
        <SearchX className="size-10 text-foreground/40" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">No tutors found</h3>
      <p className="mt-3 max-w-md text-lg leading-7 text-foreground/58">
        We could not find any tutors matching your search criteria. Try adjusting your filters or search terms.
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}