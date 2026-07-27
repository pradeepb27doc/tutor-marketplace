"use client";

import { useState, useEffect } from "react";
import { useAdminList } from "@/features/admin/hooks/use-admin-list";
import type { AdminTutorSummary } from "@/features/admin/types";
import { StatusBadge } from "../shared/status-badge";
import { SkeletonTable } from "../shared/skeleton";
import { ErrorState } from "../shared/error-state";
import { EmptyState } from "../shared/empty-state";
import { Pagination } from "../shared/pagination";
import { SearchFilterBar } from "../shared/search-filter-bar";
import { TUTOR_STATUS_FILTERS } from "@/features/admin/constants";
import { TutorActions } from "./tutor-actions";

export function TutorTable() {
  const { data, status, error, hasMore, loadMore, refresh, search, setFilters } =
    useAdminList<AdminTutorSummary>("tutors");

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      search(searchValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, search]);

  useEffect(() => {
    setFilters({ status: statusFilter || undefined });
  }, [statusFilter, setFilters]);

  const handleRetry = () => refresh();

  if (status === "loading" && data.length === 0) {
    return <SkeletonTable columns={7} rows={5} />;
  }

  if (status === "error" && data.length === 0) {
    return <ErrorState message={error ?? "Failed to load tutors"} onRetry={handleRetry} />;
  }

  if (data.length === 0) {
    return <EmptyState title="No tutors found" description="No tutors match your search criteria." />;
  }

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={TUTOR_STATUS_FILTERS.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
        filterPlaceholder="All statuses"
        searchPlaceholder="Search tutors..."
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Headline</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">City</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((tutor) => (
              <tr key={tutor.id}>
                <td className="px-4 py-2 text-sm text-gray-900 font-mono">{tutor.id.slice(0, 8)}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={tutor.status} />
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{tutor.headline ?? "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{tutor.city ?? "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{tutor.experienceYears} yrs</td>
                <td className="px-4 py-2 text-sm text-gray-600">{tutor.averageRating}</td>
                <td className="px-4 py-2 text-right">
                  <TutorActions tutor={tutor} onActionComplete={refresh} />
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
