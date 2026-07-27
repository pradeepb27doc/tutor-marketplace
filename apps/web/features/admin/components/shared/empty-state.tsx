"use client";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = "No records found", description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-gray-600">{description}</p>
      )}
    </div>
  );
}
