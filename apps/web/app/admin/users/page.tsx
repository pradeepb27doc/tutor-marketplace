"use client";

import { UserTable } from "@/features/admin/components/users/user-table";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Search, filter, and manage all platform users. Suspend or activate accounts as needed.
        </p>
      </div>
      <UserTable />
    </div>
  );
}
