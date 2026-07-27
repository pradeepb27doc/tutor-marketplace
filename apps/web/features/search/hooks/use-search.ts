import { useCallback, useEffect, useRef, useState } from "react";
import { searchApiClient } from "../services/search-service";
import type { SearchTutorsParams, TutorCard, TutorSortKey } from "../types";
import { DEFAULT_PAGE_SIZE } from "../constants";

export interface UseSearchReturn {
  tutors: TutorCard[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  sort: TutorSortKey;
  searchParams: SearchTutorsParams;
  setSort: (sort: TutorSortKey) => void;
  setSearchParams: (params: SearchTutorsParams) => void;
  loadMore: () => void;
  retry: () => void;
  clearFilters: () => void;
}

export function useSearch(): UseSearchReturn {
  const [tutors, setTutors] = useState<TutorCard[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<TutorSortKey>("RATING");
  const [searchParams, setSearchParams] = useState<SearchTutorsParams>({});
  const abortRef = useRef<AbortController | null>(null);

  const fetchTutors = useCallback(
    async (params: SearchTutorsParams, append = false) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const response = await searchApiClient.searchTutors(params);

        // If aborted, discard result
        if (controller.signal.aborted) return;

        if (append) {
          setTutors((prev) => [...prev, ...response.data]);
        } else {
          setTutors(response.data);
        }
        setNextCursor(response.page.nextCursor);
        setHasMore(response.page.hasMore);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    fetchTutors({ sort, limit: DEFAULT_PAGE_SIZE });
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    fetchTutors(
      { ...searchParams, sort, cursor: nextCursor, limit: DEFAULT_PAGE_SIZE },
      true,
    );
  }, [hasMore, isLoadingMore, isLoading, searchParams, sort, nextCursor, fetchTutors]);

  const retry = useCallback(() => {
    fetchTutors({ ...searchParams, sort, limit: DEFAULT_PAGE_SIZE });
  }, [searchParams, sort, fetchTutors]);

  const clearFilters = useCallback(() => {
    setSearchParams({});
    setSort("RATING");
    fetchTutors({ sort: "RATING", limit: DEFAULT_PAGE_SIZE });
  }, [fetchTutors]);

  return {
    tutors,
    nextCursor,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    sort,
    searchParams,
    setSort,
    setSearchParams,
    loadMore,
    retry,
    clearFilters,
  };
}