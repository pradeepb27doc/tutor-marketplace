"use client";

import React from "react";

interface BookingActionsProps {
  status: string;
  role: string | null;
  onCancel: () => void;
  onReschedule: () => void;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
  loading: boolean;
}

export function BookingActions({
  status,
  role,
  onCancel,
  onReschedule,
  onAccept,
  onReject,
  onComplete,
  loading,
}: BookingActionsProps) {
  const isParent = role === "PARENT";
  const isTutor = role === "TUTOR";

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {isParent && status === "REQUESTED" && (
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onReschedule}
            disabled={loading}
            className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            Reschedule
          </button>
        </>
      )}

      {isTutor && status === "REQUESTED" && (
        <>
          <button
            type="button"
            onClick={onAccept}
            disabled={loading}
            className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={loading}
            className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Reject
          </button>
        </>
      )}

      {isTutor && status === "ACCEPTED" && (
        <button
          type="button"
          onClick={onComplete}
          disabled={loading}
          className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
        >
          Complete
        </button>
      )}

      {(status === "ACCEPTED" || status === "REQUESTED") && isParent && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
  );
}