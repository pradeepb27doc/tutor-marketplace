export interface TutorProfileDto {
  id: string;
  userId: string;
  status: string;
  headline: string | null;
  bio: string | null;
  gender: string | null;
  experienceYears: number;
  city: string | null;
  locality: string | null;
  baseHourlyRate: string | null;
  currency: string;
  profileCompletionScore: number;
  averageRating: string;
  reviewCount: number;
  completedClassesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicTutorProfileDto {
  id: string;
  displayName: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  averageRating: string;
  reviewCount: number;
  completedClassesCount: number;
  subjects: { id: string; name: string; slug: string }[];
}

export interface CreateTutorProfileInput {
  headline?: string;
  bio?: string;
  gender?: string;
  experienceYears?: number;
  city?: string;
  locality?: string;
  baseHourlyRate?: string;
}

export interface UpdateTutorProfileInput {
  headline?: string;
  bio?: string;
  gender?: string;
  experienceYears?: number;
  city?: string;
  locality?: string;
  baseHourlyRate?: string;
}

export interface DashboardSummaryDto {
  profileCompletionPercent: number;
  completedClassesCount: number;
  averageRating: string;
  reviewCount: number;
  activeSubjectCount: number;
  status: string;
}

export interface TutorSubjectDto {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  gradeMin: number | null;
  gradeMax: number | null;
  hourlyRate: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface AddTutorSubjectInput {
  subjectId: string;
  gradeMin?: number;
  gradeMax?: number;
  hourlyRate?: string;
}

// --- Qualifications ---

export interface TutorQualificationDto {
  id: string;
  title: string;
  institutionName: string | null;
  completionYear: number | null;
  createdAt: Date;
}

export interface AddQualificationInput {
  title: string;
  institutionName?: string;
  completionYear?: number;
}

export interface UpdateQualificationInput {
  title?: string;
  institutionName?: string;
  completionYear?: number;
}

// --- Languages ---

export interface TutorLanguageDto {
  id: string;
  language: string;
  proficiency: string | null;
  createdAt: Date;
}

export interface AddLanguageInput {
  language: string;
  proficiency?: string;
}

// --- Service Areas ---

export interface TutorServiceAreaDto {
  id: string;
  city: string;
  locality: string | null;
  radiusKm: string;
  createdAt: Date;
}

export interface AddServiceAreaInput {
  city: string;
  locality?: string;
  radiusKm?: string;
}