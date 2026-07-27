"use client";

import { useState } from "react";
import { PauseCircleIcon, PlayCircleIcon } from "lucide-react";
import { useAdminActions } from "@/features/admin/hooks/use-admin-actions";
import type { AdminTutorSummary } from "@/features/admin/types";

interface TutorActionsProps {
  tutor: AdminTutorSummary;
  onActionComplete?: () => void;
}

export function TutorActions({ tutor, onActionComplete }: TutorActionsProps) {
  const { suspendUser, activateUser, isProcessing } = useAdminActions();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleSuspend = async () => {
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    const result = await suspendUser(tutor.userId, rejectReason);
    if (result.success) {
      setShowRejectDialog(false);
      setRejectReason("");
      onActionComplete?.();
    }
  };

  const handleActivate = async () => {
    const result = await activateUser(tutor.userId);
    if (result.success) {
      onActionComplete?.();
    }
  };

  const isSuspended = tutor.status === "SUSPENDED" || tutor.status === "REJECTED";

  return (
    <>
      <div className="flex items-center gap-1">
        {isSuspended ? (
          <button
            type="button"
            onClick={handleActivate}
            disabled={isProcessing}
            className="rounded-md p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
            title="Activate"
          >
            <PlayCircleIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSuspend}
            disabled={isProcessing}
            className="rounded-md p-1 text-amber-600 hover:bg-amber-50 disabled:opacity-50"
            title="Suspend"
          >
            <PauseCircleIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Suspend Tutor
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Please provide a reason for suspending this tutor.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for suspension..."
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectDialog(false)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim() || isProcessing}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
