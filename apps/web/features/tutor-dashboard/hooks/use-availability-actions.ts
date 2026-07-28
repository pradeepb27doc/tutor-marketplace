import { useCallback, useState } from "react";
import {
  addTutorWeeklySlot,
  updateTutorWeeklySlot,
  removeTutorWeeklySlot,
  addTutorBreakPeriod,
  removeTutorBreakPeriod,
} from "../services/dashboard-service";
import type {
  SlotFormData,
  BreakFormData,
  FieldErrors,
  MutationResult,
} from "../types";

/**
 * Type guard: checks if an error thrown by TutorDashboardApiClient
 * carries the extra `details` field used for validation errors.
 */
interface ApiErrorLike {
  message: string;
  code: string;
  status: number;
  details?: unknown;
}

function isApiErrorLike(error: unknown): error is ApiErrorLike {
  return (
    error instanceof Error &&
    typeof (error as { code?: unknown }).code === "string" &&
    typeof (error as { status?: unknown }).status === "number"
  );
}

/**
 * Extracts field-level validation errors from a backend API error.
 *
 * The backend's ApiHttpExceptionFilter wraps NestJS validation errors
 * in `details.message` (an array of strings like "startTime must match...").
 * We attempt to parse the field name from each message.
 */
export function extractFieldErrors(error: unknown): FieldErrors {
  if (!isApiErrorLike(error)) return {};

  const details = error.details;
  if (details === null || typeof details !== "object") return {};

  const fieldErrors: FieldErrors = {};

  // NestJS ValidationPipe returns: { statusCode, message: [...], error: "Bad Request" }
  const detailsRecord = details as Record<string, unknown>;
  const messages = detailsRecord.message;

  if (Array.isArray(messages)) {
    for (const msg of messages) {
      if (typeof msg !== "string") continue;
      // NestJS messages start with the property name, e.g. "startTime must match..."
      const match = msg.match(/^([a-zA-Z_]+)\s+/);
      if (match) {
        const field = match[1];
        fieldErrors[field] = fieldErrors[field]
          ? `${fieldErrors[field]}; ${msg}`
          : msg;
      } else {
        fieldErrors._form = fieldErrors._form
          ? `${fieldErrors._form}; ${msg}`
          : msg;
      }
    }
  }

  return fieldErrors;
}

/**
 * Mutation hooks for tutor availability management.
 *
 * Reuses the existing dashboard-service API functions. Each mutation
 * refetches availability on success via the provided `refetch` callback.
 */
export function useAvailabilityActions(
  accessToken: string | null,
  refetch: () => void,
) {
  const [isMutating, setIsMutating] = useState(false);

  const createSlot = useCallback(
    async (data: SlotFormData): Promise<MutationResult> => {
      if (!accessToken) {
        return { success: false, error: "Missing access token" };
      }
      setIsMutating(true);
      try {
        await addTutorWeeklySlot(accessToken, data);
        refetch();
        return { success: true };
      } catch (err) {
        const fieldErrors = extractFieldErrors(err);
        const message =
          err instanceof Error ? err.message : "Failed to create slot";
        return {
          success: false,
          fieldErrors:
            Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
          error: message,
        };
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, refetch],
  );

  const updateSlot = useCallback(
    async (
      slotId: string,
      data: Partial<SlotFormData>,
    ): Promise<MutationResult> => {
      if (!accessToken) {
        return { success: false, error: "Missing access token" };
      }
      setIsMutating(true);
      try {
        await updateTutorWeeklySlot(accessToken, slotId, data);
        refetch();
        return { success: true };
      } catch (err) {
        const fieldErrors = extractFieldErrors(err);
        const message =
          err instanceof Error ? err.message : "Failed to update slot";
        return {
          success: false,
          fieldErrors:
            Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
          error: message,
        };
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, refetch],
  );

  const deleteSlot = useCallback(
    async (slotId: string): Promise<MutationResult> => {
      if (!accessToken) {
        return { success: false, error: "Missing access token" };
      }
      setIsMutating(true);
      try {
        await removeTutorWeeklySlot(accessToken, slotId);
        refetch();
        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete slot";
        return { success: false, error: message };
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, refetch],
  );

  const createBreak = useCallback(
    async (data: BreakFormData): Promise<MutationResult> => {
      if (!accessToken) {
        return { success: false, error: "Missing access token" };
      }
      setIsMutating(true);
      try {
        await addTutorBreakPeriod(accessToken, data);
        refetch();
        return { success: true };
      } catch (err) {
        const fieldErrors = extractFieldErrors(err);
        const message =
          err instanceof Error ? err.message : "Failed to create break period";
        return {
          success: false,
          fieldErrors:
            Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
          error: message,
        };
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, refetch],
  );

  const deleteBreak = useCallback(
    async (breakId: string): Promise<MutationResult> => {
      if (!accessToken) {
        return { success: false, error: "Missing access token" };
      }
      setIsMutating(true);
      try {
        await removeTutorBreakPeriod(accessToken, breakId);
        refetch();
        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to delete break period";
        return { success: false, error: message };
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, refetch],
  );

  return {
    createSlot,
    updateSlot,
    deleteSlot,
    createBreak,
    deleteBreak,
    isMutating,
  };
}
