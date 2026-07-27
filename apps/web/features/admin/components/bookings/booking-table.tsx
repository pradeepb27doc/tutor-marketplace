"use client";

import { useState, useEffect } from "react";
import { useAdminList } from "@/features/admin/hooks/use-admin-list";
import type { AdminBookingSummary } from "@/features/admin/types";
import { StatusBadge } from "../shared/status-badge";
import { SkeletonTable } from "../shared/skeleton";
import { ErrorState } from "../shared/error-state";
import { EmptyState } from "../shared/empty-state";
import { Pagination } from "../shared/pagination";
import { SearchFilterBar } from "../shared/search-filter-bar";
import { BOOKING_STATUS_FILTERS } from "@/features/admin/constants";
import { BookingActions } from "./booking-actions";

export function BookingTable() {
  const { data, status, error, hasMore, loadMore, refresh, setFilters } =
    useAdminList<AdminBookingSummary>("bookings");

  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setFilters({ status: statusFilter || undefined });
  }, [statusFilter, setFilters]);

  const handleRetry = () => refresh();

  if (status === "loading" && data.length === 0) {
    return <SkeletonTable columns={8} rows={5} />;
  }

  if (status === "error" && data.length === 0) {
    return <ErrorState message={error ?? "Failed to load bookings"} onRetry={handleRetry} />;
  }

  if (data.length === 0) {
    return <EmptyState title="No bookings found" description="No bookings match your criteria." />;
  }

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchValue=""
        onSearchChange={() => {}}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={BOOKING_STATUS_FILTERS.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
        filterPlaceholder="All statuses"
        searchPlaceholder="Search bookings..."
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tutor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((booking) => (
              <tr key={booking.id}>
                <td className="px-4 py-2 text-sm text-gray-900 font-mono">{booking.publicId.slice(0, 8)}</td>
                <td className="px-4 py-2 text-sm text-gray-600 font-mono">{booking.parentId.slice(0, 8)}</td>
                <td className="px-4 py-2 text-sm text-gray-600 font-mono">{booking.tutorId.slice(0, 8)}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{new Date(booking.startAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{booking.priceAmount} {booking.currency}</td>
                <td className="px-4 py-2 text-right">
                  <BookingActions booking={booking} onActionComplete={refresh} />
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
