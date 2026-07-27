"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bookingManagementApiClient } from "../services/booking-management-service";
import type { BookingManagementResponse, StatusHistoryEntryResponse } from "../types";

type BookingDetailState = {
  data: BookingManagementResponse | null;
  history: StatusHistoryEntryResponse[];
  loading: boolean;
  error: string | null;
};

export function useBookingDetail(bookingId: string | undefined, accessToken: string | null) {
  const [state, setState] = useState<BookingDetailState>({
    data: null,
    history: [],
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!bookingId || !accessToken) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [bookingRes, historyRes] = await Promise.all([
        bookingManagementApiClient.getBooking(accessToken, bookingId),
        bookingManagementApiClient.getBookingHistory(accessToken, bookingId),
      ]);

      if (mountedRef.current) {
        setState({
          data: bookingRes.data,
          history: historyRes.data,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load booking details";

      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
      }
    }
  }, [bookingId, accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    void load();
  }, [load]);

  return {
    ...state,
    retry,
  };
}