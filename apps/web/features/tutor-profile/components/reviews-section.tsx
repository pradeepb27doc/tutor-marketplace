"use client";

import { RatingSummary } from "../../reviews/components/rating-summary";
import { ReviewList } from "../../reviews/components/review-list";

export interface ReviewsSectionProps {
  tutorId: string;
}

export function ReviewsSection({ tutorId }: ReviewsSectionProps) {
  return (
    <section className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] sm:p-8">
      <h2 className="text-3xl font-semibold tracking-[-0.045em]">Reviews</h2>

      <div className="mt-8 space-y-8">
        <RatingSummary tutorId={tutorId} />
        <ReviewList tutorId={tutorId} limit={10} />
      </div>
    </section>
  );
}