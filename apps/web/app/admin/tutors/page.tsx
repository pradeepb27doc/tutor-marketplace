"use client";

import { TutorTable } from "@/features/admin/components/tutors/tutor-table";

export default function AdminTutorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tutor Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage tutors, suspend/activate accounts, and review verification status.
        </p>
      </div>
      <TutorTable />
    </div>
  );
}
