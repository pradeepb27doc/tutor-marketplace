"use client";

import { useState, useEffect } from "react";
import { useAdminList } from "@/features/admin/hooks/use-admin-list";
import type { AuditLogRecord } from "@/features/admin/types";
import { SkeletonTable } from "../shared/skeleton";
import { ErrorState } from "../shared/error-state";
import { EmptyState } from "../shared/empty-state";
import { Pagination } from "../shared/pagination";
import { SearchFilterBar } from "../shared/search-filter-bar";
import { AUDIT_ENTITY_TYPES } from "@/features/admin/constants";

export function AuditLogTable() {
  const { data, status, error, hasMore, loadMore, refresh, setFilters } =
    useAdminList<AuditLogRecord>("audit-logs");

  const [entityTypeFilter, setEntityTypeFilter] = useState("");

  useEffect(() => {
    setFilters({ entityType: entityTypeFilter || undefined });
  }, [entityTypeFilter, setFilters]);

  const handleRetry = () => refresh();

  if (status === "loading" && data.length === 0) {
    return <SkeletonTable columns={6} rows={5} />;
  }

  if (status === "error" && data.length === 0) {
    return <ErrorState message={error ?? "Failed to load audit logs"} onRetry={handleRetry} />;
  }

  if (data.length === 0) {
    return <EmptyState title="No audit logs found" description="No audit logs match your criteria." />;
  }

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchValue=""
        onSearchChange={() => {}}
        filterValue={entityTypeFilter}
        onFilterChange={setEntityTypeFilter}
        filterOptions={AUDIT_ENTITY_TYPES.map((s) => ({ value: s, label: s }))}
        filterPlaceholder="All entity types"
        searchPlaceholder="Search audit logs..."
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2 text-sm text-gray-900 font-mono">{log.id.slice(0, 8)}</td>
                <td className="px-4 py-2 text-sm text-gray-600 font-mono">{log.actorUserId?.slice(0, 8) ?? "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{log.action}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{log.entityType}{log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{log.ipAddress ?? "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination hasMore={hasMore} isLoading={status === "loading"} onLoadMore={loadMore} />
    </div>
  );
}
