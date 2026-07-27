"use client";

import { useReviewModeration } from "@/features/admin/hooks/use-review-moderation";
import type { ReviewDto } from "@/features/admin/types";
import { StatusBadge } from "../shared/status-badge";
import { SkeletonTable } from "../shared/skeleton";
import { ErrorState } from "../shared/error-state";
import { EmptyState } from "../shared/empty-state";
import { Pagination } from "../shared/pagination";
import { SearchFilterBar } from "../shared/search-filter-bar";
import { REVIEW_STATUS_FILTERS } from "@/features/admin/constants";
import { ReviewActions } from "./review-actions";

export function ReviewTable() {
  const { reviews, status, error, hasMore, loadMore, refresh, statusFilter, setStatusFilter } =
    useReviewModeration(true);

  const handleRetry = () => refresh();

  if (status === "loading" && reviews.length === 0) {
    return <SkeletonTable columns={6} rows={5} />;
  }

  if (status === "error" && reviews.length === 0) {
    return <ErrorState message={error ?? "Failed to load reviews"} onRetry={handleRetry} />;
  }

  if (reviews.length === 0) {
    return <EmptyState title="No reviews found" description="No reviews match your criteria." />;
  }

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchValue=""
        onSearchChange={() => {}}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={REVIEW_STATUS_FILTERS.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
        filterPlaceholder="All statuses"
        searchPlaceholder="Search reviews..."
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {reviews.map((review: ReviewDto) => (
              <tr key={review.id}>
                <td className="px-4 py-2 text-sm text-gray-900 font-mono">{review.id.slice(0, 8)}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{review.rating}/5</td>
                <td className="px-4 py-2 text-sm text-gray-600">{review.title ?? "—"}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={review.status} />
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{new Date(review.submittedAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-right">
                  <ReviewActions review={review} onActionComplete={refresh} />
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
