"use client";

import { PaymentTable } from "@/features/admin/components/payments/payment-table";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          View all payment transactions. Filter by status to track captured, failed, and refunded payments.
        </p>
      </div>
      <PaymentTable />
    </div>
  );
}
