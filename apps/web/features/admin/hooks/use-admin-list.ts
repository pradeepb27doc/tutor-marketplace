"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth-service";
import { adminApiClient, AdminApiError } from "../services/admin-service";
import type {
  AdminUserSummary,
  AdminTutorSummary,
  AdminBookingSummary,
  AdminPaymentSummary,
  AdminRefundSummary,
  AuditLogRecord,
  CursorPage,
  LoadStatus,
} from "../types";
import { ADMIN_PAGE_SIZE } from "../constants";

export type AdminListResource =
  | "users"
  | "tutors"
  | "bookings"
  | "payments"
  | "refunds"
  | "audit-logs";

export type AdminListItem =
  | AdminUserSummary
  | AdminTutorSummary
  | AdminBookingSummary
  | AdminPaymentSummary
  | AdminRefundSummary
  | AuditLogRecord;

export interface AdminListFilters {
  status?: string;
  role?: string;
  search?: string;
  entityType?: string;
  action?: string;
}

export interface UseAdminListResult<T extends AdminListItem> {
  data: T[];
  status: LoadStatus;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
  filters: AdminListFilters;
  setFilters: (filters: AdminListFilters) => void;
  loadMore: () => void;
  refresh: () => void;
  search: (query: string) => void;
}

export function useAdminList<T extends AdminListItem>(
  resource: AdminListResource,
  initialFilters: AdminListFilters = {},
): UseAdminListResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AdminListFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
        const query = {
          cursor,
          limit: ADMIN_PAGE_SIZE,
          ...filters,
          ...(searchQuery ? { search: searchQuery } : {}),
        };

        let result: CursorPage<T>;
        switch (resource) {
          case "users":
            result = (await adminApiClient.listUsers(accessToken, query)) as unknown as CursorPage<T>;
            break;
          case "tutors":
            result = (await adminApiClient.listTutors(accessToken, query)) as unknown as CursorPage<T>;
            break;
          case "bookings":
            result = (await adminApiClient.listBookings(accessToken, query)) as unknown as CursorPage<T>;
            break;
          case "payments":
            result = (await adminApiClient.listPayments(accessToken, query)) as unknown as CursorPage<T>;
            break;
          case "refunds":
            result = (await adminApiClient.listRefunds(accessToken, query)) as unknown as CursorPage<T>;
            break;
          case "audit-logs":
            result = (await adminApiClient.listAuditLogs(accessToken, query)) as unknown as CursorPage<T>;
            break;
          default:
            return;
        }

        if (reset) {
          setData(result.data);
        } else {
          setData((prev) => [...prev, ...result.data]);
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
          setError("Failed to load data");
        }
        setStatus("error");
      }
    },
    [resource, filters, searchQuery],
  );

  const loadMore = useCallback(() => {
    if (status === "loading" || !hasMore) return;
    void fetchPage(nextCursor, false);
  }, [status, hasMore, nextCursor, fetchPage]);

  const refresh = useCallback(() => {
    void fetchPage(null, true);
  }, [fetchPage]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const setFilters = useCallback((newFilters: AdminListFilters) => {
    setFiltersState(newFilters);
  }, []);

  useEffect(() => {
    void fetchPage(null, true);
  }, [fetchPage]);

  return {
    data,
    status,
    error,
    hasMore,
    nextCursor,
    filters,
    setFilters,
    loadMore,
    refresh,
    search,
  };
}
