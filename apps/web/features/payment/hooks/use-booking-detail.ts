"use client";

import { useCallback, useState } from "react";
import {
  paymentApiClient,
  PaymentApiError,
} from "../services/payment-service";
import type { BookingDto } from "@/features/booking/types";

export type BookingDetailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; booking: BookingDto }
  | {
      status: "error";
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

interface GetBookingParams {
  bookingId: string;
  accessToken: string;
}

export function useBookingDetail() {
  const [state, setState] = useState<BookingDetailState>({
    status: "idle",
  });

  const fetchBooking = useCallback(
    async (params: GetBookingParams) => {
      setState({ status: "loading" });

      try {
        const response = await paymentApiClient.getBooking(
          params.bookingId,
          params.accessToken,
        );

        setState({ status: "success", booking: response.data });
        return response.data;
      } catch (err) {
        if (err instanceof PaymentApiError) {
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

  return { state, fetchBooking, reset };
}
