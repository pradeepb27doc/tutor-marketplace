"use client";

interface SkeletonRowProps {
  columns: number;
}

export function SkeletonRow({ columns }: SkeletonRowProps) {
  return (
    <li className="border-b border-gray-200 py-3">
      <div className="flex items-center gap-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-gray-200"
            style={{ width: `${100 / columns - 2}%` }}
          />
        ))}
      </div>
    </li>
  );
}

export function SkeletonTable({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <ul className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} columns={columns} />
      ))}
    </ul>
  );
}
