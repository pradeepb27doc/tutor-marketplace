"use client";

import { useState } from "react";
import { XCircleIcon } from "lucide-react";
import { useAdminActions } from "@/features/admin/hooks/use-admin-actions";
import type { AdminBookingSummary } from "@/features/admin/types";

interface BookingActionsProps {
  booking: AdminBookingSummary;
  onActionComplete?: () => void;
}

export function BookingActions({ booking, onActionComplete }: BookingActionsProps) {
  const { cancelBooking, isProcessing } = useAdminActions();
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState("");

  const handleCancel = () => setShowDialog(true);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    const result = await cancelBooking(booking.id, reason);
    if (result.success) {
      setShowDialog(false);
      setReason("");
      onActionComplete?.();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isProcessing}
        className="rounded-md p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
        title="Cancel Booking"
      >
        <XCircleIcon className="h-4 w-4" />
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
            <p className="mt-2 text-sm text-gray-600">
              Provide a reason for cancelling this booking.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason..."
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!reason.trim() || isProcessing}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
