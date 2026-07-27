"use client";

import { AuditLogTable } from "@/features/admin/components/audit-logs/audit-log-table";

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-600">
          View system audit logs. Filter by entity type to track specific actions.
        </p>
      </div>
      <AuditLogTable />
    </div>
  );
}
