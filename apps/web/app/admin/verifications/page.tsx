"use client";

import { VerificationTable } from "@/features/admin/components/verifications/verification-table";

export default function AdminVerificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review pending tutor verification cases. Approve, reject, or request changes.
        </p>
      </div>
      <VerificationTable />
    </div>
  );
}
