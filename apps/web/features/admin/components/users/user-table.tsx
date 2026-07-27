"use client";

import { useState, useEffect } from "react";
import { useAdminList } from "@/features/admin/hooks/use-admin-list";
import type { AdminUserSummary } from "@/features/admin/types";
import { StatusBadge } from "../shared/status-badge";
import { SkeletonTable } from "../shared/skeleton";
import { ErrorState } from "../shared/error-state";
import { EmptyState } from "../shared/empty-state";
import { Pagination } from "../shared/pagination";
import { SearchFilterBar } from "../shared/search-filter-bar";
import { USER_STATUS_FILTERS } from "@/features/admin/constants";
import { UserActions } from "./user-actions";

export function UserTable() {
  const { data, status, error, hasMore, loadMore, refresh, search, setFilters } =
    useAdminList<AdminUserSummary>("users");

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      search(searchValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, search]);

  useEffect(() => {
    setFilters({
      status: statusFilter || undefined,
    });
  }, [statusFilter, setFilters]);

  const handleRetry = () => {
    refresh();
  };

  if (status === "loading" && data.length === 0) {
    return <SkeletonTable columns={7} rows={5} />;
  }

  if (status === "error" && data.length === 0) {
    return <ErrorState message={error ?? "Failed to load users"} onRetry={handleRetry} />;
  }

  if (data.length === 0) {
    return <EmptyState title="No users found" description="No users match your search criteria." />;
  }

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={USER_STATUS_FILTERS.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
        filterPlaceholder="All statuses"
        searchPlaceholder="Search users..."
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{user.displayName ?? user.publicId}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{user.primaryRole}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{user.email ?? "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-right">
                  <UserActions user={user} onActionComplete={refresh} />
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
