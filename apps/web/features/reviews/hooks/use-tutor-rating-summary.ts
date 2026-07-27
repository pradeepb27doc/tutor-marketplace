"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TutorRatingSummaryDto } from "../types";
import { reviewsApiClient } from "../services/reviews-service";

type Status = "idle" | "loading" | "success" | "error";

export interface UseTutorRatingSummaryResult {
  summary: TutorRatingSummaryDto | null;
  status: Status;
  error: string | null;
  retry: () => void;
}

export function useTutorRatingSummary(
  tutorId: string,
): UseTutorRatingSummaryResult {
  const [summary, setSummary] = useState<TutorRatingSummaryDto | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!tutorId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus("loading");
    setError(null);

    try {
      const response = await reviewsApiClient.getTutorRatingSummary(tutorId, controller.signal);
      setSummary(response.data);
      setStatus("success");
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    }
  }, [tutorId]);

  useEffect(() => {
    fetchSummary();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSummary]);

  return {
    summary,
    status,
    error,
    retry: fetchSummary,
  };
}