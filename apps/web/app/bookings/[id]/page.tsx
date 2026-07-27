"use client";

import React from "react";
import { useAuth } from "../../../features/auth/components/auth-provider";
import { useBookingDetail } from "../../../features/booking-management/hooks/use-booking-detail";
import { useUpdateBookingAction } from "../../../features/booking-management/hooks/use-update-booking-action";
import { Timeline } from "../../../features/booking-management/components/timeline";
import { BookingActions } from "../../../features/booking-management/components/booking-actions";
import { bookingStatusToVariant, formatBookingStatus } from "../../../features/booking-management/types";

export default function BookingDetailPage() {
  const { getAccessToken, user } = useAuth();
  const accessToken = getAccessToken();
  const role = user?.primaryRole ?? null;

  const bookingId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() : undefined;

  const { data, history, loading, error, retry } = useBookingDetail(bookingId, accessToken);
  const { state: actionState, action: performAction, reset: resetAction } = useUpdateBookingAction();

  const handleAction = async (kind: "accept" | "reject" | "cancel" | "reschedule" | "complete") => {
    if (!bookingId) return;
    const result = await performAction({ kind, bookingId });
    if (result) {
      retry();
      resetAction();
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm font-medium text-red-800">Failed to load booking</p>
        <p className="mt-1 text-xs text-red-600">{error ?? "Unknown error"}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const start = new Date(data.startAt);
  const end = new Date(data.endAt);
  const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
      <p className="mt-1 text-sm text-gray-600">Public ID: {data.publicId}</p>

      <div className="mt-6 rounded-md border border-gray-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <span
              className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                bookingStatusToVariant(data.status) === "success"
                  ? "bg-green-100 text-green-800"
                  : bookingStatusToVariant(data.status) === "danger"
                    ? "bg-red-100 text-red-800"
                    : bookingStatusToVariant(data.status) === "warning"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {formatBookingStatus(data.status)}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Date & Time</p>
            <p className="mt-1 text-sm text-gray-900">{start.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Duration</p>
            <p className="mt-1 text-sm text-gray-900">{durationMinutes} minutes</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Price</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: data.currency,
              }).format(Number(data.priceAmount))}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Subject ID</p>
            <p className="mt-1 text-sm text-gray-900">{data.subjectId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Service Mode</p>
            <p className="mt-1 text-sm text-gray-900">{data.serviceMode}</p>
          </div>
        </div>

        {data.cancellationReason && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500">Cancellation Reason</p>
            <p className="mt-1 text-sm text-gray-900">{data.cancellationReason}</p>
          </div>
        )}

        <BookingActions
          status={data.status}
          role={role}
          onCancel={() => handleAction("cancel")}
          onReschedule={() => handleAction("reschedule")}
          onAccept={() => handleAction("accept")}
          onReject={() => handleAction("reject")}
          onComplete={() => handleAction("complete")}
          loading={actionState.loading}
        />

        {actionState.error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-xs text-red-700">{actionState.error}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Status History</h2>
        <div className="mt-3">
          <Timeline history={history} />
        </div>
      </div>
    </div>
  );
}