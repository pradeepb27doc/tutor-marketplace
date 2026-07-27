"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface PaginationProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function Pagination({ hasMore, isLoading, onLoadMore }: PaginationProps) {
  if (!hasMore) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Load More
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
