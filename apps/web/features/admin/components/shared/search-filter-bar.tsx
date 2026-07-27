"use client";

import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue?: string;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
  filterPlaceholder?: string;
  searchPlaceholder?: string;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = "All statuses",
  searchPlaceholder = "Search...",
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>
      {filterOptions.length > 0 && (
        <select
          value={filterValue ?? ""}
          onChange={(e) => onFilterChange(e.target.value)}
          className={cn(
            "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:w-auto",
            !filterValue ? "text-gray-500" : "text-gray-900",
          )}
        >
          <option value="">{filterPlaceholder}</option>
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
