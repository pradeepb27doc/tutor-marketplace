import { cn } from "@/lib/utils";

type StatusVariant = "default" | "success" | "warning" | "danger" | "info";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  label?: string;
}

const STATUS_VARIANT_MAP: Record<string, StatusVariant> = {
  // User statuses
  ACTIVE: "success",
  SUSPENDED: "danger",
  PENDING: "warning",
  // Tutor statuses
  VERIFIED: "success",
  NOT_VERIFIED: "warning",
  // Booking statuses
  REQUESTED: "info",
  ACCEPTED: "info",
  COMPLETED: "success",
  CANCELLED_BY_PARENT: "danger",
  CANCELLED_BY_TUTOR: "danger",
  REJECTED: "danger",
  RESCHEDULED: "warning",
  EXPIRED: "default",
  // Payment statuses
  CAPTURED: "success",
  AUTHORIZED: "warning",
  FAILED: "danger",
  REFUNDED: "warning",
  CANCELLED: "default",
  // Refund statuses
  APPROVED: "success",
  PROCESSED: "success",
  // Review statuses
  PUBLISHED: "success",
  HIDDEN: "default",
  FLAGGED: "warning",
  // Verification statuses
  CHANGES_REQUESTED: "warning",
  UNDER_REVIEW: "info",
  SUBMITTED: "warning",
  NOT_SUBMITTED: "default",
};

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export function StatusBadge({ status, variant, label }: StatusBadgeProps) {
  const resolvedVariant = variant ?? STATUS_VARIANT_MAP[status] ?? "default";
  const displayLabel = label ?? status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[resolvedVariant],
      )}
    >
      {displayLabel}
    </span>
  );
}
