"use client";

import { useCallback, useState } from "react";
import {
  bookingApiClient,
  BookingApiError,
} from "../services/booking-service";
import type { BookingDto } from "../types";

export type CreateBookingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; booking: BookingDto }
  | {
      status: "error";
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

interface CreateBookingParams {
  studentId: string;
  tutorId: string;
  subjectId: string;
  tutorSubjectId?: string;
  availabilitySlotId: string;
  accessToken: string;
}

export function useCreateBooking() {
  const [state, setState] = useState<CreateBookingState>({ status: "idle" });

  const createBooking = useCallback(
    async (params: CreateBookingParams) => {
      setState({ status: "loading" });

      try {
        const response = await bookingApiClient.createBooking(
          {
            studentId: params.studentId,
            tutorId: params.tutorId,
            subjectId: params.subjectId,
            tutorSubjectId: params.tutorSubjectId,
            availabilitySlotId: params.availabilitySlotId,
          },
          params.accessToken,
        );

        setState({ status: "success", booking: response.data });
        return response.data;
      } catch (err) {
        if (err instanceof BookingApiError) {
          setState({
            status: "error",
            code: err.code,
            message: err.message,
            details: err.details,
          });
        } else {
          setState({
            status: "error",
            code: "UNKNOWN",
            message:
              err instanceof Error
                ? err.message
                : "An unexpected error occurred",
          });
        }
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, createBooking, reset };
}