"use client";

import React from "react";

export function SkeletonRow() {
  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="text-right">
          <div className="ml-auto h-5 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="mt-2 ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </li>
  );
}