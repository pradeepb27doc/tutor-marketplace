"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { reviewsApiClient } from "../services/reviews-service";
import type { CreateReviewInput } from "../types";

export interface ReviewFormProps {
  bookingId: string;
  studentId: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function ReviewForm({ bookingId, studentId, onSuccess, onError }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (rating === 0) {
      setSubmitError("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateReviewInput = {
        bookingId,
        studentId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      };

      await reviewsApiClient.createReview(bookingId, data);
      setRating(0);
      setHoverRating(0);
      setTitle("");
      setComment("");
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setSubmitError(message);
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background p-6">
      <h3 className="text-base font-semibold text-foreground">Write a Review</h3>

      <div className="mt-4">
        <label className="text-sm font-medium text-foreground/60">Rating</label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <Star
                className={`size-6 transition ${
                  star <= (hoverRating || rating)
                    ? "fill-foreground text-foreground"
                    : "text-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="title" className="text-sm font-medium text-foreground/60">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="Summarize your experience"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="comment" className="text-sm font-medium text-foreground/60">
          Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="Share details of your experience"
        />
      </div>

      {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-2xl bg-foreground py-3 text-sm font-medium text-background transition hover:bg-foreground/90 disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}