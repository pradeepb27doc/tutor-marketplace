"use client";

import { useVerificationCases } from "@/features/admin/hooks/use-verification-cases";
import type { VerificationCaseSummaryDto } from "@/features/admin/types";
import { StatusBadge } from "../shared/status-badge";
import { SkeletonTable } from "../shared/skeleton";
import { ErrorState } from "../shared/error-state";
import { EmptyState } from "../shared/empty-state";
import { Pagination } from "../shared/pagination";
import { VERIFICATION_TYPE_LABELS } from "@/features/admin/constants";
import { VerificationActions } from "./verification-actions";

export function VerificationTable() {
  const { cases, status, error, hasMore, loadMore, refresh } = useVerificationCases(true);

  const handleRetry = () => refresh();

  if (status === "loading" && cases.length === 0) {
    return <SkeletonTable columns={6} rows={5} />;
  }

  if (status === "error" && cases.length === 0) {
    return <ErrorState message={error ?? "Failed to load verification cases"} onRetry={handleRetry} />;
  }

  if (cases.length === 0) {
    return <EmptyState title="No verification cases found" description="No pending verification cases." />;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Showing {cases.length} pending verification case{cases.length !== 1 ? "s" : ""}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tutor ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">City</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Headline</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending Checks</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {cases.map((caseItem: VerificationCaseSummaryDto) => (
              <tr key={caseItem.tutorId}>
                <td className="px-4 py-2 text-sm text-gray-900 font-mono">{caseItem.tutorId.slice(0, 8)}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={caseItem.status} />
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{caseItem.city ?? "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{caseItem.headline ?? "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {caseItem.pendingCheckTypes.map((t) => VERIFICATION_TYPE_LABELS[t] ?? t).join(", ") || "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  <VerificationActions caseItem={caseItem} onActionComplete={refresh} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination hasMore={hasMore} isLoading={status === "loading"} onLoadMore={loadMore} />
    </div>
  );
}
