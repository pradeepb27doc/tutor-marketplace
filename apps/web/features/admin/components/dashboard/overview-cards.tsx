import type { AdminOverview } from "../../types";

interface OverviewCardsProps {
  overview: AdminOverview | null;
  status: "idle" | "loading" | "success" | "error";
}

export function OverviewCards({ overview, status }: OverviewCardsProps) {
  if (status === "loading" || !overview) {
    return <OverviewSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Failed to load overview metrics</p>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusEntries = (byStatus: Record<string, number>): string => {
    return Object.entries(byStatus)
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Users"
        value={overview.users.total}
        subtitle={statusEntries(overview.users.byStatus)}
      />
      <MetricCard
        title="Tutors"
        value={overview.tutors.total}
        subtitle={statusEntries(overview.tutors.byStatus)}
      />
      <MetricCard
        title="Bookings"
        value={overview.bookings.total}
        subtitle={statusEntries(overview.bookings.byStatus)}
      />
      <MetricCard
        title="Payments"
        value={overview.payments.total}
        subtitle={`Captured: ${formatCurrency(overview.payments.totalCapturedAmount)}`}
      />
      <MetricCard
        title="Refunds"
        value={overview.refunds.total}
        subtitle="Total refunds processed"
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
}

function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
          <div className="h-7 w-12 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-40 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
