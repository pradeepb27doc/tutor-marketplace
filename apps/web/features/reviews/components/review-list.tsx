"use client";

import { useMemo } from "react";
import { ReviewCard } from "./review-card";
import { useTutorReviews } from "../hooks/use-tutor-reviews";
import { ReviewListSkeleton } from "./review-list-skeleton";
import { ReviewListError } from "./review-list-error";
import { ReviewListEmpty } from "./review-list-empty";

export interface ReviewListProps {
  tutorId: string;
  limit?: number;
}

export function ReviewList({ tutorId, limit = 10 }: ReviewListProps) {
  const { reviews, status, error, retry, loadMore, hasMore } = useTutorReviews(tutorId, {
    limit,
  });

  const displayedReviews = useMemo(() => {
    if (!limit) return reviews;
    return reviews.slice(0, limit);
  }, [reviews, limit]);

  if (status === "loading") {
    return <ReviewListSkeleton count={limit} />;
  }

  if (status === "error") {
    return <ReviewListError message={error ?? "Unknown error"} onRetry={retry} />;
  }

  if (displayedReviews.length === 0) {
    return <ReviewListEmpty />;
  }

  return (
    <div className="space-y-4">
      {displayedReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          className="w-full rounded-2xl border border-border bg-background py-3 text-sm font-medium text-foreground transition hover:bg-foreground/5"
        >
          Load more reviews
        </button>
      )}
    </div>
  );
}