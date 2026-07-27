"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth-service";
import { adminApiClient, AdminApiError } from "../services/admin-service";
import type { ReviewDto, LoadStatus } from "../types";
import { ADMIN_PAGE_SIZE } from "../constants";

export interface UseReviewModerationResult {
  reviews: ReviewDto[];
  status: LoadStatus;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useReviewModeration(enabled = true): UseReviewModerationResult {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchPage = useCallback(
    async (cursor: string | null, reset = false) => {
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        setError("Unauthorized");
        setStatus("error");
        return;
      }

      if (reset) {
        setStatus("loading");
        setError(null);
      }

      try {
        const res = await adminApiClient.listReviews(accessToken, {
          cursor,
          limit: ADMIN_PAGE_SIZE,
          status: statusFilter || undefined,
        });

        if (reset) {
          setReviews(res.data);
        } else {
          setReviews((prev) => [...prev, ...res.data]);
        }
        setNextCursor(res.page.nextCursor);
        setHasMore(res.page.hasMore);
        setStatus("success");
      } catch (err) {
        if (err instanceof AdminApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load reviews");
        }
        setStatus("error");
      }
    },
    [statusFilter],
  );

  const loadMore = useCallback(() => {
    if (status === "loading" || !hasMore) return;
    void fetchPage(nextCursor, false);
  }, [status, hasMore, nextCursor, fetchPage]);

  const refresh = useCallback(() => {
    void fetchPage(null, true);
  }, [fetchPage]);

  useEffect(() => {
    if (!enabled) return;
    void fetchPage(null, true);
  }, [enabled, fetchPage]);

  return {
    reviews,
    status,
    error,
    hasMore,
    nextCursor,
    statusFilter,
    setStatusFilter,
    loadMore,
    refresh,
  };
}
