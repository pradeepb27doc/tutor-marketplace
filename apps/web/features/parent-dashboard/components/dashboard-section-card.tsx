import React from "react";

interface DashboardSectionCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardSectionCard({
  title,
  action,
  children,
}: DashboardSectionCardProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="text-sm text-gray-700">{children}</div>
    </section>
  );
}