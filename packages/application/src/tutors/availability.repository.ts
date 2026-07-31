import type { TutorRepository } from "./tutor.repository.js";

export type DayOfWeekValue =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

// --- Weekly recurring availability slots (template only) ---

export interface TutorWeeklySlotRecord {
  id: string;
  tutorId: string;
  dayOfWeek: DayOfWeekValue;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  timezone: string;
  serviceMode: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTutorWeeklySlotRecord {
  tutorId: string;
  dayOfWeek: DayOfWeekValue;
  startTime: string;
  endTime: string;
  timezone?: string;
  serviceMode: string;
  capacity?: number;
}

export interface UpdateTutorWeeklySlotRecord {
  dayOfWeek?: DayOfWeekValue;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  serviceMode?: string;
  capacity?: number;
}

export interface TutorWeeklySlotRepository {
  findByTutorId(tutorId: string): Promise<TutorWeeklySlotRecord[]>;
  findById(id: string): Promise<TutorWeeklySlotRecord | null>;
  /**
   * Returns existing weekly slots for the same tutor, day of week, and service
   * mode. Overlap detection is performed in the Application layer using these
   * candidates. The repository simply returns the relevant same-day, same-mode
   * rows (excluding excludeSlotId when provided).
   */
  findOverlapping(
    tutorId: string,
    dayOfWeek: DayOfWeekValue,
    serviceMode: string,
    excludeSlotId?: string,
  ): Promise<TutorWeeklySlotRecord[]>;
  create(data: CreateTutorWeeklySlotRecord): Promise<TutorWeeklySlotRecord>;
  update(id: string, data: UpdateTutorWeeklySlotRecord): Promise<TutorWeeklySlotRecord>;
  delete(id: string): Promise<void>;
}

// --- Recurring daily break periods ---

export interface TutorBreakPeriodRecord {
  id: string;
  tutorId: string;
  dayOfWeek: DayOfWeekValue | null; // null = all days
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTutorBreakPeriodRecord {
  tutorId: string;
  dayOfWeek?: DayOfWeekValue | null;
  startTime: string;
  endTime: string;
  reason?: string | null;
}

export interface TutorBreakPeriodRepository {
  findByTutorId(tutorId: string): Promise<TutorBreakPeriodRecord[]>;
  create(data: CreateTutorBreakPeriodRecord): Promise<TutorBreakPeriodRecord>;
  delete(id: string): Promise<void>;
}

// --- Holiday / unavailable date ranges (reuses existing TutorBlackoutPeriod) ---

export interface TutorBlackoutPeriodRecord {
  id: string;
  tutorId: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTutorBlackoutPeriodRecord {
  tutorId: string;
  startAt: Date;
  endAt: Date;
  reason?: string | null;
}

export interface TutorBlackoutPeriodRepository {
  findByTutorId(tutorId: string): Promise<TutorBlackoutPeriodRecord[]>;
  findById(id: string): Promise<TutorBlackoutPeriodRecord | null>;
  create(data: CreateTutorBlackoutPeriodRecord): Promise<TutorBlackoutPeriodRecord>;
  delete(id: string): Promise<void>;
}

export type { TutorRepository };