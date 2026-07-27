"use client";

import { Star } from "lucide-react";
import { useTutorRatingSummary } from "../hooks/use-tutor-rating-summary";

export interface RatingSummaryProps {
  tutorId: string;
}

export function RatingSummary({ tutorId }: RatingSummaryProps) {
  const { summary, status, retry } = useTutorRatingSummary(tutorId);

  if (status === "loading") {
    return <RatingSummarySkeleton />;
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-border bg-background p-6">
        <p className="text-sm text-red-500">Failed to load ratings</p>
        <button
          type="button"
          onClick={retry}
          className="mt-2 text-sm font-medium text-foreground underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary || summary.reviewCount === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background p-6">
        <p className="text-sm text-foreground/60">No ratings yet</p>
      </div>
    );
  }

  const { averageRating, reviewCount, distribution } = summary;

  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl font-semibold tracking-[-0.03em]">{averageRating.toFixed(1)}</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`size-5 ${
                star <= Math.round(averageRating) ? "fill-foreground text-foreground" : "text-foreground/30"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-foreground/60">
          ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating] ?? 0;
          const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground/60 w-2">{rating}</span>
              <div className="h-2 flex-1 rounded-full bg-foreground/10">
                <div
                  className="h-2 rounded-full bg-foreground/70"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-foreground/50 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RatingSummarySkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-12 animate-pulse rounded bg-foreground/10" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="size-5 animate-pulse rounded bg-foreground/10" />
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded bg-foreground/10" />
            <div className="h-2 flex-1 animate-pulse rounded bg-foreground/10" />
            <div className="h-2 w-8 animate-pulse rounded bg-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}