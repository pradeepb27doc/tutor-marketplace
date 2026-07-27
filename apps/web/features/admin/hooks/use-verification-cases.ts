"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth-service";
import { adminApiClient, AdminApiError } from "../services/admin-service";
import type {
  VerificationCaseSummaryDto,
  VerificationCaseDto,
  LoadStatus,
} from "../types";
import { ADMIN_PAGE_SIZE } from "../constants";

export interface UseVerificationCasesResult {
  cases: VerificationCaseSummaryDto[];
  status: LoadStatus;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
  loadMore: () => void;
  refresh: () => void;
}

export function useVerificationCases(enabled = true): UseVerificationCasesResult {
  const [cases, setCases] = useState<VerificationCaseSummaryDto[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

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
        const result = await adminApiClient.listVerificationCases(accessToken, {
          cursor,
          limit: ADMIN_PAGE_SIZE,
        });

        if (reset) {
          setCases(result.data);
        } else {
          setCases((prev) => [...prev, ...result.data]);
        }
        setNextCursor(result.page.nextCursor);
        setHasMore(result.page.hasMore);
        setStatus("success");
      } catch (err) {
        if (err instanceof AdminApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load verification cases");
        }
        setStatus("error");
      }
    },
    [],
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
    cases,
    status,
    error,
    hasMore,
    nextCursor,
    loadMore,
    refresh,
  };
}

export async function fetchVerificationCaseDetail(
  tutorId: string,
): Promise<{ data: VerificationCaseDto; error: string | null }> {
  const accessToken = authService.getAccessToken();
  if (!accessToken) {
    return { data: null as unknown as VerificationCaseDto, error: "Unauthorized" };
  }

  try {
    const res = await adminApiClient.getVerificationCase(accessToken, tutorId);
    return { data: res.data, error: null };
  } catch (err) {
    if (err instanceof AdminApiError) {
      return { data: null as unknown as VerificationCaseDto, error: err.message };
    } else if (err instanceof Error) {
      return { data: null as unknown as VerificationCaseDto, error: err.message };
    }
    return { data: null as unknown as VerificationCaseDto, error: "Failed to load verification case" };
  }
}
