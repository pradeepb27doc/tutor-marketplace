"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bookingApiClient, BookingApiError } from "../services/booking-service";
import { DEFAULT_TIMEZONE } from "../constants";

export interface AvailabilitySlotView {
  id: string;
  startAt: string;
  endAt: string;
  timezone: string;
  serviceMode: string;
}

export type AvailabilityState =
  | { status: "loading" }
  | { status: "success"; slots: AvailabilitySlotView[] }
  | { status: "empty" }
  | { status: "error"; message: string };

export function useAvailability(tutorId: string) {
  const [state, setState] = useState<AvailabilityState>({ status: "loading" });
  const abortRef = useRef<AbortController | null>(null);

  const fetchAvailability = useCallback(
    async (id: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ status: "loading" });

      try {
        // Fetch availability for the next 14 days
        const now = new Date();
        const from = new Date(now);
        from.setHours(0, 0, 0, 0);

        const to = new Date(from);
        to.setDate(to.getDate() + 13);
        to.setHours(23, 59, 59, 999);

        const fromStr = from.toISOString().split("T")[0];
        const toStr = to.toISOString().split("T")[0];

        const response = await bookingApiClient.getPublicAvailability(
          id,
          fromStr,
          toStr,
          DEFAULT_TIMEZONE,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        const slots = response.slots ?? [];

        if (slots.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({
          status: "success",
          slots: slots.map((s) => ({
            id: s.id,
            startAt: s.startAt,
            endAt: s.endAt,
            timezone: s.timezone,
            serviceMode: s.serviceMode,
          })),
        });
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err instanceof BookingApiError) {
          setState({
            status: "error",
            message: err.message,
          });
        } else {
          setState({
            status: "error",
            message:
              err instanceof Error
                ? err.message
                : "Failed to load availability",
          });
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (tutorId) {
      fetchAvailability(tutorId);
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [tutorId, fetchAvailability]);

  const retry = useCallback(() => {
    if (tutorId) {
      fetchAvailability(tutorId);
    }
  }, [tutorId, fetchAvailability]);

  return { state, retry };
}