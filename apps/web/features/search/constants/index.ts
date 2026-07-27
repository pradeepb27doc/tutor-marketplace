import type { TutorSortKey } from "../types";

export const SORT_OPTIONS: { label: string; value: TutorSortKey }[] = [
  { label: "Rating", value: "RATING" },
  { label: "Experience", value: "EXPERIENCE" },
  { label: "Price: Low to High", value: "PRICE_ASC" },
  { label: "Price: High to Low", value: "PRICE_DESC" },
  { label: "Newest", value: "NEWEST" },
  { label: "Most Booked", value: "MOST_BOOKED" },
];

export const DEFAULT_PAGE_SIZE = 20;

export const DEBOUNCE_MS = 300;

export const SKELETON_COUNT = 6;