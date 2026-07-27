"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReviewDto, ReviewQueryParams } from "../types";
import { reviewsApiClient } from "../services/reviews-service";

type Status = "idle" | "loading" | "success" | "error";

export interface UseTutorReviewsResult {
  reviews: ReviewDto[];
  status: Status;
  error: string | null;
  retry: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export function useTutorReviews(
  tutorId: string,
  query?: ReviewQueryParams,
): UseTutorReviewsResult {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!tutorId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus("loading");
    setError(null);

    try {
      const response = await reviewsApiClient.listTutorReviews(tutorId, query, controller.signal);
      const data = response.data;

      setReviews(data);

      // Determine if more pages exist based on returned data vs requested limit
      const limit = query?.limit ?? 10;
      setHasMore(data.length >= limit);
      setStatus("success");
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setStatus("error");
      }
    }
  }, [tutorId, query]);

  useEffect(() => {
    fetchReviews();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchReviews]);

  const loadMore = useCallback(async () => {
    if (status !== "success" || !hasMore || reviews.length === 0) return;

    const lastReview = reviews[reviews.length - 1];
    const limit = query?.limit ?? 10;

    try {
      const response = await reviewsApiClient.listTutorReviews(tutorId, {
        ...query,
        cursor: lastReview.id,
        limit,
      });

      const data = response.data;
      setReviews((prev) => [...prev, ...data]);
      setHasMore(data.length >= limit);
    } catch {
      // Silently fail for load-more to avoid disrupting UX
    }
  }, [status, hasMore, reviews, query, tutorId]);

  return {
    reviews,
    status,
    error,
    retry: fetchReviews,
    loadMore,
    hasMore,
  };
}