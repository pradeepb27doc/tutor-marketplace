import type { SubjectRecord } from "../index.js";

// --- Search Sort & Mode ---

export type TutorSortKey =
  | "RATING"
  | "EXPERIENCE"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "NEWEST"
  | "MOST_BOOKED";

export type TutorSearchMode = "ONLINE" | "OFFLINE" | "HYBRID";

// --- Filters (public search request mapped to these) ---

export interface TutorSearchFilters {
  subjectId?: string;
  grade?: number;
  curricula?: string[];
  city?: string;
  locality?: string;
  mode?: TutorSearchMode;
  gender?: string;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  verifiedOnly?: boolean;
}

export interface TutorSearchQuery {
  filters: TutorSearchFilters;
  sort: TutorSortKey;
  /** Encoded cursor from a previous page. Null/undefined for first page. */
  cursor?: string | null;
  limit: number;
}

// --- Read models returned by the search repository ---

export interface TutorSearchSubjectSummary {
  id: string;
  name: string;
  slug: string;
}

export interface TutorSearchCardRecord {
  id: string;
  userId: string;
  displayName: string | null;
  headline: string | null;
  city: string | null;
  locality: string | null;
  gender: string | null;
  experienceYears: number;
  averageRating: string;
  reviewCount: number;
  completedClassesCount: number;
  baseHourlyRate: string | null;
  currency: string;
  isVerified: boolean;
  primaryMode: TutorSearchMode | null;
  lowestHourlyRate: string | null;
  subjectCount: number;
  subjects: TutorSearchSubjectSummary[];
}

export interface TutorSearchResult {
  items: TutorSearchCardRecord[];
  nextCursor: string | null;
}

// --- Repository port ---

export interface TutorSearchRepository {
  search(query: TutorSearchQuery): Promise<TutorSearchResult>;
}

export type { SubjectRecord };