import type { SubjectRecord } from "../index.js";

export interface TutorRecord {
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
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTutorRecord {
  userId: string;
  headline?: string | null;
  bio?: string | null;
  gender?: string | null;
  experienceYears?: number;
  city?: string | null;
  locality?: string | null;
  baseHourlyRate?: string | null;
}

export interface TutorRepository {
  findByUserId(userId: string): Promise<TutorRecord | null>;
  findById(id: string): Promise<TutorRecord | null>;
  create(data: CreateTutorRecord): Promise<TutorRecord>;
  update(id: string, data: Partial<TutorRecord>): Promise<TutorRecord>;
}

export interface TutorSubjectRecord {
  id: string;
  tutorId: string;
  subjectId: string;
  gradeMin: number | null;
  gradeMax: number | null;
  hourlyRate: string | null;
  serviceModes: string[];
  curricula: string[];
  isActive: boolean;
  createdAt: Date;
  subject?: SubjectRecord;
}

export interface CreateTutorSubjectRecord {
  tutorId: string;
  subjectId: string;
  gradeMin?: number | null;
  gradeMax?: number | null;
  hourlyRate?: string | null;
}

export interface TutorSubjectRepository {
  findByTutorId(tutorId: string): Promise<TutorSubjectRecord[]>;
  findById(id: string): Promise<TutorSubjectRecord | null>;
  findByTutorIdAndSubjectId(tutorId: string, subjectId: string): Promise<TutorSubjectRecord | null>;
  create(data: CreateTutorSubjectRecord): Promise<TutorSubjectRecord>;
  softDelete(id: string): Promise<void>;
}

// --- Qualification ---

export interface TutorQualificationRecord {
  id: string;
  tutorId: string;
  title: string;
  institutionName: string | null;
  completionYear: number | null;
  createdAt: Date;
}

export interface CreateTutorQualificationRecord {
  tutorId: string;
  title: string;
  institutionName?: string | null;
  completionYear?: number | null;
}

export interface TutorQualificationRepository {
  findByTutorId(tutorId: string): Promise<TutorQualificationRecord[]>;
  findById(id: string): Promise<TutorQualificationRecord | null>;
  create(data: CreateTutorQualificationRecord): Promise<TutorQualificationRecord>;
  update(id: string, data: Partial<TutorQualificationRecord>): Promise<TutorQualificationRecord>;
  delete(id: string): Promise<void>;
}

// --- Language ---

export interface TutorLanguageRecord {
  id: string;
  tutorId: string;
  language: string;
  proficiency: string | null;
  createdAt: Date;
}

export interface CreateTutorLanguageRecord {
  tutorId: string;
  language: string;
  proficiency?: string | null;
}

export interface TutorLanguageRepository {
  findByTutorId(tutorId: string): Promise<TutorLanguageRecord[]>;
  create(data: CreateTutorLanguageRecord): Promise<TutorLanguageRecord>;
  delete(id: string): Promise<void>;
}

// --- Service Area ---

export interface TutorServiceAreaRecord {
  id: string;
  tutorId: string;
  city: string;
  locality: string | null;
  radiusKm: string;
  createdAt: Date;
}

export interface CreateTutorServiceAreaRecord {
  tutorId: string;
  city: string;
  locality?: string | null;
  radiusKm?: string | null;
}

export interface TutorServiceAreaRepository {
  findByTutorId(tutorId: string): Promise<TutorServiceAreaRecord[]>;
  create(data: CreateTutorServiceAreaRecord): Promise<TutorServiceAreaRecord>;
  delete(id: string): Promise<void>;
}