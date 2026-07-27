"use client";

import { useCallback, useState } from "react";
import { bookingManagementApiClient } from "../services/booking-management-service";
import type { BookingManagementResponse } from "../types";

type ActionState = {
  loading: boolean;
  error: string | null;
};

type ActionResult =
  | { kind: "accept"; booking: BookingManagementResponse }
  | { kind: "reject"; booking: BookingManagementResponse }
  | { kind: "cancel"; booking: BookingManagementResponse }
  | { kind: "reschedule"; booking: BookingManagementResponse }
  | { kind: "complete"; booking: BookingManagementResponse };

type UseUpdateBookingActionResult = {
  state: ActionState;
  action: (params: {
    kind: ActionResult["kind"];
    bookingId: string;
    input?: { reason?: string; newAvailabilitySlotId?: string };
  }) => Promise<ActionResult | null>;
  reset: () => void;
};

export function useUpdateBookingAction(): UseUpdateBookingActionResult {
  const [state, setState] = useState<ActionState>({
    loading: false,
    error: null,
  });

  const action = useCallback(
    async (params: {
      kind: ActionResult["kind"];
      bookingId: string;
      input?: { reason?: string; newAvailabilitySlotId?: string };
    }): Promise<ActionResult | null> => {
      setState({ loading: true, error: null });

      try {
        let result: { data: BookingManagementResponse };

        switch (params.kind) {
          case "accept":
            result = await bookingManagementApiClient.acceptBooking(
              params.input?.reason ?? "",
              params.bookingId,
            );
            break;
          case "reject":
            result = await bookingManagementApiClient.rejectBooking(
              params.input?.reason ?? "",
              params.bookingId,
            );
            break;
          case "cancel":
            result = await bookingManagementApiClient.cancelBooking(
              params.input?.reason ?? "",
              params.bookingId,
              params.input?.reason,
            );
            break;
          case "reschedule":
            if (!params.input?.newAvailabilitySlotId) {
              throw new Error("newAvailabilitySlotId is required for reschedule");
            }
            result = await bookingManagementApiClient.rescheduleBooking(
              params.input?.reason ?? "",
              params.bookingId,
              params.input.newAvailabilitySlotId,
              params.input.reason,
            );
            break;
          case "complete":
            result = await bookingManagementApiClient.completeBooking(
              params.input?.reason ?? "",
              params.bookingId,
            );
            break;
          default:
            throw new Error(`Unsupported action: ${params.kind}`);
        }

        setState({ loading: false, error: null });

        return { kind: params.kind, booking: result.data };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Booking action failed";

        setState({ loading: false, error: message });

        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  return {
    state,
    action,
    reset,
  };
}