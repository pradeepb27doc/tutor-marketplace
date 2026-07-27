"use client";

import { useAdminOverview } from "@/features/admin/hooks/use-admin-overview";
import { OverviewCards } from "@/features/admin/components/dashboard/overview-cards";
import { ErrorState } from "@/features/admin/components/shared/error-state";

export default function AdminDashboardPage() {
  const { overview, status, error, refresh } = useAdminOverview(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Platform-wide metrics and overview
        </p>
      </div>

      {status === "error" && error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <OverviewCards overview={overview} status={status} />
      )}

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick Links</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <a
              href="/admin/users"
              className="text-blue-600 hover:underline"
            >
              User Management
            </a>
          </li>
          <li>
            <a
              href="/admin/tutors"
              className="text-blue-600 hover:underline"
            >
              Tutor Management
            </a>
          </li>
          <li>
            <a
              href="/admin/bookings"
              className="text-blue-600 hover:underline"
            >
              Booking Management
            </a>
          </li>
          <li>
            <a
              href="/admin/payments"
              className="text-blue-600 hover:underline"
            >
              Payment Management
            </a>
          </li>
          <li>
            <a
              href="/admin/reviews"
              className="text-blue-600 hover:underline"
            >
              Review Moderation
            </a>
          </li>
          <li>
            <a
              href="/admin/verifications"
              className="text-blue-600 hover:underline"
            >
              Verification Queue
            </a>
          </li>
          <li>
            <a
              href="/admin/audit-logs"
              className="text-blue-600 hover:underline"
            >
              Audit Logs
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
