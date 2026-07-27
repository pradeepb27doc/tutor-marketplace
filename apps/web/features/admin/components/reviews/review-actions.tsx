"use client";

import { useState } from "react";
import { CheckCircleIcon, XCircleIcon, FlagIcon } from "lucide-react";
import { useAdminActions } from "@/features/admin/hooks/use-admin-actions";
import type { ReviewDto } from "@/features/admin/types";

interface ReviewActionsProps {
  review: ReviewDto;
  onActionComplete?: () => void;
}

export function ReviewActions({ review, onActionComplete }: ReviewActionsProps) {
  const { publishReview, hideReview, moderateReview, isProcessing } = useAdminActions();
  const [showModerateDialog, setShowModerateDialog] = useState(false);
  const [moderateStatus, setModerateStatus] = useState("FLAGGED");

  const handlePublish = async () => {
    const result = await publishReview(review.id);
    if (result.success) onActionComplete?.();
  };

  const handleHide = async () => {
    const result = await hideReview(review.id);
    if (result.success) onActionComplete?.();
  };

  const handleModerateConfirm = async () => {
    const result = await moderateReview(review.id, moderateStatus as "PUBLISHED" | "HIDDEN" | "FLAGGED");
    if (result.success) {
      setShowModerateDialog(false);
      onActionComplete?.();
    }
  };

  return (
    <>
      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={handlePublish}
          disabled={isProcessing}
          className="rounded-md p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
          title="Publish"
        >
          <CheckCircleIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleHide}
          disabled={isProcessing}
          className="rounded-md p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          title="Hide"
        >
          <XCircleIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowModerateDialog(true)}
          disabled={isProcessing}
          className="rounded-md p-1 text-amber-600 hover:bg-amber-50 disabled:opacity-50"
          title="Moderate"
        >
          <FlagIcon className="h-4 w-4" />
        </button>
      </div>

      {showModerateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Moderate Review</h3>
            <p className="mt-2 text-sm text-gray-600">
              Select a moderation status for this review.
            </p>
            <select
              value={moderateStatus}
              onChange={(e) => setModerateStatus(e.target.value)}
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="PUBLISHED">Publish</option>
              <option value="HIDDEN">Hide</option>
              <option value="FLAGGED">Flag</option>
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModerateDialog(false)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModerateConfirm}
                disabled={isProcessing}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
