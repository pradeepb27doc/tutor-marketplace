import type { TutorSortKey, TutorSearchMode } from "./search.repository.js";

export interface TutorSearchSubjectDto {
  id: string;
  name: string;
  slug: string;
}

export interface TutorCardDto {
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
  primaryMode: TutorSearchMode | null;
  lowestHourlyRate: string | null;
  subjectCount: number;
  subjects: TutorSearchSubjectDto[];
}

export interface TutorSearchResultDto {
  data: TutorCardDto[];
  nextCursor: string | null;
}

// --- Public tutor detail ---

export interface PublicTutorSubjectDto {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  gradeMin: number | null;
  gradeMax: number | null;
  hourlyRate: string | null;
  serviceModes: string[];
  curricula: string[];
  isActive: boolean;
}

export interface PublicTutorQualificationDto {
  id: string;
  title: string;
  institutionName: string | null;
  completionYear: number | null;
}

export interface PublicTutorLanguageDto {
  id: string;
  language: string;
  proficiency: string | null;
}

export interface PublicTutorServiceAreaDto {
  id: string;
  city: string;
  locality: string | null;
  radiusKm: string;
}

export interface PublicTutorVerificationSummaryDto {
  isVerified: boolean;
  checkedTypes: string[];
}

export interface PublicTutorDetailDto {
  id: string;
  userId: string;
  displayName: string | null;
  headline: string | null;
  bio: string | null;
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
  subjects: PublicTutorSubjectDto[];
  qualifications: PublicTutorQualificationDto[];
  languages: PublicTutorLanguageDto[];
  serviceAreas: PublicTutorServiceAreaDto[];
  verification: PublicTutorVerificationSummaryDto;
}

// --- Query DTO (validated by API layer) ---

export interface SearchTutorsQueryDto {
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
  sort?: TutorSortKey;
  cursor?: string | null;
  limit?: number;
}