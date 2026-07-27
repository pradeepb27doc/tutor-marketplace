"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bookingManagementApiClient } from "../services/booking-management-service";
import type { BookingManagementResponse, BookingQueryParams } from "../types";
import { DEFAULT_LIST_LIMIT } from "../constants";

type BookingListLoadState = {
  data: BookingManagementResponse[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  upcomingCount: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
};

type BookingTab = "upcoming" | "pending" | "completed" | "cancelled";

const TAB_TO_STATUSES: Record<BookingTab, string[]> = {
  upcoming: ["ACCEPTED"],
  pending: ["REQUESTED"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED_BY_PARENT", "CANCELLED_BY_TUTOR"],
};

type UseBookingsListParams = {
  accessToken: string | null;
  role?: string | null;
};

export function useBookingsList({
  accessToken,
  role,
}: UseBookingsListParams) {
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");
  const [filters, setFilters] = useState<BookingQueryParams>({
    limit: DEFAULT_LIST_LIMIT,
  });
  const [state, setState] = useState<BookingListLoadState>({
    data: [],
    loading: false,
    error: null,
    hasMore: false,
    upcomingCount: 0,
    pendingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!accessToken) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const statuses = TAB_TO_STATUSES[activeTab];
      const listPromise = role === "TUTOR"
        ? bookingManagementApiClient.listTutorBookings(accessToken, {
            ...filters,
            status: statuses.join(","),
          })
        : bookingManagementApiClient.listBookings(accessToken, {
            ...filters,
            status: statuses.join(","),
          });

      const listRes = await listPromise;

      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const parent = await bookingManagementApiClient.listBookings(accessToken, {
        from: start.toISOString(),
        to: end.toISOString(),
        limit: 100,
      });

      const counts = {
        upcoming: parent.data.filter((b) => TAB_TO_STATUSES.upcoming.includes(b.status)).length,
        pending: parent.data.filter((b) => TAB_TO_STATUSES.pending.includes(b.status)).length,
        completed: parent.data.filter((b) => TAB_TO_STATUSES.completed.includes(b.status)).length,
        cancelled: parent.data.filter((b) => TAB_TO_STATUSES.cancelled.includes(b.status)).length,
      };

      if (mountedRef.current) {
        setState({
          data: listRes.data,
          loading: false,
          error: null,
          hasMore: listRes.hasMore,
          upcomingCount: counts.upcoming,
          pendingCount: counts.pending,
          completedCount: counts.completed,
          cancelledCount: counts.cancelled,
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load bookings";

      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
      }
    }
  }, [accessToken, activeTab, filters, role]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    void load();
  }, [load]);

  return {
    data: state,
    loading: state.loading,
    error: state.error,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    retry,
  };
}