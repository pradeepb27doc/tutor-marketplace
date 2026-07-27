"use client";

import { Star } from "lucide-react";
import type { ReviewDto } from "../types";

export interface ReviewCardProps {
  review: ReviewDto;
  showTutorInfo?: boolean;
}

export function ReviewCard({ review, showTutorInfo = false }: ReviewCardProps) {
  const date = new Date(review.submittedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`size-4 ${
                star <= review.rating ? "fill-foreground text-foreground" : "text-foreground/30"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-foreground/50">{date}</span>
      </div>

      {review.title && (
        <h3 className="mt-3 text-base font-semibold text-foreground">{review.title}</h3>
      )}

      {review.comment && (
        <p className="mt-2 text-sm leading-6 text-foreground/70">{review.comment}</p>
      )}

      {showTutorInfo && (
        <div className="mt-4 flex items-center gap-2 text-xs text-foreground/50">
          <span>Booking ID: {review.bookingId}</span>
        </div>
      )}
    </div>
  );
}