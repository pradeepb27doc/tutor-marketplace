import type { ReactNode } from "react";

interface LoadingStateProps {
  label?: string;
  children?: ReactNode;
  className?: string;
}

export function LoadingState({
  label = "Loading...",
  children,
  className = "mx-auto max-w-5xl px-4 py-10",
}: LoadingStateProps) {
  return (
    <div className={className} role="status" aria-live="polite" aria-busy="true">
      {children ?? (
        <div className="space-y-4">
          <span className="sr-only">{label}</span>
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}