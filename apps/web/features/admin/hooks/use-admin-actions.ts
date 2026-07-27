"use client";

import { useCallback, useState } from "react";
import { authService } from "@/features/auth/services/auth-service";
import { adminApiClient, AdminApiError } from "../services/admin-service";
import type { AdminActionResult, ReviewModerationStatus } from "../types";

export interface UseAdminActionsResult {
  suspendUser: (userId: string, reason?: string) => Promise<AdminActionResult>;
  activateUser: (userId: string) => Promise<AdminActionResult>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<AdminActionResult>;
  approveVerification: (tutorId: string) => Promise<AdminActionResult>;
  rejectVerification: (tutorId: string, rejectionReason: string) => Promise<AdminActionResult>;
  requestChangesVerification: (tutorId: string, note?: string) => Promise<AdminActionResult>;
  publishReview: (reviewId: string) => Promise<AdminActionResult>;
  hideReview: (reviewId: string) => Promise<AdminActionResult>;
  moderateReview: (reviewId: string, status: ReviewModerationStatus) => Promise<AdminActionResult>;
  isProcessing: boolean;
  processingError: string | null;
  processingAction: string | null;
}

export function useAdminActions(): UseAdminActionsResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const executeAction = useCallback(
    async (
      action: string,
      fn: () => Promise<unknown>,
    ): Promise<AdminActionResult> => {
      setIsProcessing(true);
      setProcessingAction(action);
      setProcessingError(null);

      try {
        const result = await fn();
        setIsProcessing(false);
        setProcessingAction(null);
        return { success: true, data: result, error: null };
      } catch (err) {
        let message = "Action failed";
        if (err instanceof AdminApiError) {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setIsProcessing(false);
        setProcessingAction(null);
        setProcessingError(message);
        return { success: false, data: null, error: message };
      }
    },
    [],
  );

  const suspendUser = useCallback(
    (userId: string, reason?: string) =>
      executeAction("suspendUser", () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error("Unauthorized");
        return adminApiClient.suspendUser(token, userId, reason);
      }),
    [executeAction],
  );

  const activateUser = useCallback(
    (userId: string) =>
      executeAction("activateUser", () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error("Unauthorized");
        return adminApiClient.activateUser(token, userId);
      }),
    [executeAction],
  );

  const cancelBooking = useCallback(
    (bookingId: string, reason?: string) =>
      executeAction("cancelBooking", () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error("Unauthorized");
        return adminApiClient.cancelBooking(token, bookingId, reason);
      }),
    [executeAction],
  );

  const approveVerification = useCallback(
    (tutorId: string) =>
      executeAction("approveVerification", () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error("Unauthorized");
        return adminApiClient.approveVerification(token, tutorId);
      }),
    [executeAction],
  );

  const rejectVerification = useCallback(
    (tutorId: string, rejectionReason: string) =>
      executeAction("rejectVerification", () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error("Unauthorized");
        return adminApiClient.rejectVerification(token, tutorId, rejectionReason);
      }),
    [executeAction],
  );

  const requestChangesVerification = useCallback(
    (tutorId: string, note?: string) =>
      executeAction("requestChangesVerification", () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error("Unauthorized");
        return adminApiClient.requestChangesVerification(token, tutorId, note);
      }),
    [executeAction],
  );

  const publishReview = useCallback(
    (reviewId: string) =>
      executeAction("publishReview", () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error("Unauthorized");
        return adminApiClient.publishReview(token, reviewId);
      }),
    [executeAction],
  );

  const hideReview = useCallback(
    (reviewId: string) =>
      executeAction("hideReview", () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error("Unauthorized");
        return adminApiClient.hideReview(token, reviewId);
      }),
    [executeAction],
  );

  const moderateReview = useCallback(
    (reviewId: string, status: ReviewModerationStatus) =>
      executeAction("moderateReview", () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error("Unauthorized");
        return adminApiClient.moderateReview(token, reviewId, status);
      }),
    [executeAction],
  );

  return {
    suspendUser,
    activateUser,
    cancelBooking,
    approveVerification,
    rejectVerification,
    requestChangesVerification,
    publishReview,
    hideReview,
    moderateReview,
    isProcessing,
    processingError,
    processingAction,
  };
}
