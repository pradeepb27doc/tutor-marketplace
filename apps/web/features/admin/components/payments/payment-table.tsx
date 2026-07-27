"use client";

import { useState, useEffect } from "react";
import { useAdminList } from "@/features/admin/hooks/use-admin-list";
import type { AdminPaymentSummary } from "@/features/admin/types";
import { StatusBadge } from "../shared/status-badge";
import { SkeletonTable } from "../shared/skeleton";
import { ErrorState } from "../shared/error-state";
import { EmptyState } from "../shared/empty-state";
import { Pagination } from "../shared/pagination";
import { SearchFilterBar } from "../shared/search-filter-bar";
import { PAYMENT_STATUS_FILTERS } from "@/features/admin/constants";

export function PaymentTable() {
  const { data, status, error, hasMore, loadMore, refresh, setFilters } =
    useAdminList<AdminPaymentSummary>("payments");

  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setFilters({ status: statusFilter || undefined });
  }, [statusFilter, setFilters]);

  const handleRetry = () => refresh();

  if (status === "loading" && data.length === 0) {
    return <SkeletonTable columns={7} rows={5} />;
  }

  if (status === "error" && data.length === 0) {
    return <ErrorState message={error ?? "Failed to load payments"} onRetry={handleRetry} />;
  }

  if (data.length === 0) {
    return <EmptyState title="No payments found" description="No payments match your criteria." />;
  }

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchValue=""
        onSearchChange={() => {}}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={PAYMENT_STATUS_FILTERS.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
        filterPlaceholder="All statuses"
        searchPlaceholder="Search payments..."
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-2 text-sm text-gray-900 font-mono">{payment.id.slice(0, 8)}</td>
                <td className="px-4 py-2 text-sm text-gray-600 font-mono">{payment.bookingId.slice(0, 8)}</td>
                <td className="px-4 py-2 text-sm text-gray-600 font-mono">{payment.parentId.slice(0, 8)}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{payment.provider}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{payment.amount} {payment.currency}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination hasMore={hasMore} isLoading={status === "loading"} onLoadMore={loadMore} />
    </div>
  );
}
