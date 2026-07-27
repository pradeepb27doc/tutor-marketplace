"use client";

import { useState } from "react";
import { CheckCircleIcon, XCircleIcon, Edit3Icon } from "lucide-react";
import { useAdminActions } from "@/features/admin/hooks/use-admin-actions";
import type { VerificationCaseSummaryDto } from "@/features/admin/types";

interface VerificationActionsProps {
  caseItem: VerificationCaseSummaryDto;
  onActionComplete?: () => void;
}

export function VerificationActions({ caseItem, onActionComplete }: VerificationActionsProps) {
  const { approveVerification, rejectVerification, requestChangesVerification, isProcessing } = useAdminActions();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRequestChangesDialog, setShowRequestChangesDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [changesNote, setChangesNote] = useState("");

  const handleApprove = async () => {
    const result = await approveVerification(caseItem.tutorId);
    if (result.success) onActionComplete?.();
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    const result = await rejectVerification(caseItem.tutorId, rejectReason);
    if (result.success) {
      setShowRejectDialog(false);
      setRejectReason("");
      onActionComplete?.();
    }
  };

  const handleRequestChangesConfirm = async () => {
    const result = await requestChangesVerification(caseItem.tutorId, changesNote || undefined);
    if (result.success) {
      setShowRequestChangesDialog(false);
      setChangesNote("");
      onActionComplete?.();
    }
  };

  return (
    <>
      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isProcessing}
          className="rounded-md p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
          title="Approve"
        >
          <CheckCircleIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowRequestChangesDialog(true)}
          disabled={isProcessing}
          className="rounded-md p-1 text-amber-600 hover:bg-amber-50 disabled:opacity-50"
          title="Request Changes"
        >
          <Edit3Icon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowRejectDialog(true)}
          disabled={isProcessing}
          className="rounded-md p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
          title="Reject"
        >
          <XCircleIcon className="h-4 w-4" />
        </button>
      </div>

      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Reject Verification</h3>
            <p className="mt-2 text-sm text-gray-600">Provide a reason for rejecting this verification.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason..."
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
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestChangesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Request Changes</h3>
            <p className="mt-2 text-sm text-gray-600">Provide a note for the tutor about what changes are needed.</p>
            <textarea
              value={changesNote}
              onChange={(e) => setChangesNote(e.target.value)}
              placeholder="Note (optional)..."
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequestChangesDialog(false)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestChangesConfirm}
                disabled={isProcessing}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                Request Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
