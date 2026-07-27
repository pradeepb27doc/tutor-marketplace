export interface TutorSearchSubject {
  id: string;
  name: string;
  slug: string;
}

export interface TutorCard {
  id: string;
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
  primaryMode: "ONLINE" | "OFFLINE" | "HYBRID" | null;
  lowestHourlyRate: string | null;
  subjectCount: number;
  subjects: TutorSearchSubject[];
}

export interface CursorPage {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface TutorSearchResponse {
  data: TutorCard[];
  page: CursorPage;
}

export type TutorSortKey =
  | "RATING"
  | "EXPERIENCE"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "NEWEST"
  | "MOST_BOOKED";

export type TutorSearchMode = "ONLINE" | "OFFLINE" | "HYBRID";

export interface SearchTutorsParams {
  subjectSlug?: string;
  grade?: number;
  curriculum?: string;
  city?: string;
  serviceMode?: "ONLINE" | "HOME_TUITION" | "GROUP_CLASS";
  maxFee?: number;
  minRating?: number;
  experienceMin?: number;
  experienceMax?: number;
  sort?: TutorSortKey;
  cursor?: string | null;
  limit?: number;
}