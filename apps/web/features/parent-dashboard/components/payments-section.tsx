import React from "react";
import { DashboardSectionCard } from "./dashboard-section-card";
import { EmptyState } from "./empty-state";
import { ErrorCard } from "./error-card";
import { SkeletonCard } from "./skeleton-card";
import { formatPaymentStatus } from "../types";
import type { PaymentResponse } from "../types";

interface PaymentsSectionProps {
  loading: "idle" | "loading" | "success" | "error";
  error: string | null;
  payments: { data: PaymentResponse[] };
  onRetry: () => void;
}

export function PaymentsSection({
  loading,
  error,
  payments,
  onRetry,
}: PaymentsSectionProps) {
  return (
    <DashboardSectionCard title="Payment History">
      {error ? (
        <ErrorCard message={error} onRetry={onRetry} />
      ) : loading === "loading" ? (
        <SkeletonCard />
      ) : payments.data.length === 0 ? (
        <EmptyState section="payments" />
      ) : (
        <ul className="divide-y divide-gray-100">
          {payments.data.map((payment) => (
            <li key={payment.id} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 capitalize">
                    {payment.provider}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(payment.createdAt).toLocaleString()} • {formatPaymentStatus(payment.status)}
                  </p>
                  {payment.method ? (
                    <p className="text-xs text-gray-500 capitalize">{payment.method}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: payment.currency,
                    }).format(payment.amount)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardSectionCard>
  );
}