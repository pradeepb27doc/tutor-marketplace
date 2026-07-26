import type {
  DayOfWeekValue,
  TutorWeeklySlotRecord,
  TutorBreakPeriodRecord,
  TutorBlackoutPeriodRecord,
} from "./availability.repository.js";

export interface TutorWeeklySlotDto {
  id: string;
  dayOfWeek: DayOfWeekValue;
  startTime: string;
  endTime: string;
  timezone: string;
  serviceMode: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddWeeklySlotInput {
  dayOfWeek: DayOfWeekValue;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  serviceMode: string;
  timezone?: string;
  capacity?: number;
}

export interface UpdateWeeklySlotInput {
  dayOfWeek?: DayOfWeekValue;
  startTime?: string;
  endTime?: string;
  serviceMode?: string;
  timezone?: string;
  capacity?: number;
}

export interface TutorBreakPeriodDto {
  id: string;
  dayOfWeek: DayOfWeekValue | null;
  startTime: string;
  endTime: string;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddBreakPeriodInput {
  dayOfWeek?: DayOfWeekValue | null;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  reason?: string | null;
}

export interface TutorBlackoutPeriodDto {
  id: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddBlackoutPeriodInput {
  startAt: Date;
  endAt: Date;
  reason?: string | null;
}

export interface WeeklyAvailabilityDto {
  weeklySlots: TutorWeeklySlotDto[];
  breaks: TutorBreakPeriodDto[];
}

export interface PublicAvailabilityDayDto {
  date: string; // ISO date "YYYY-MM-DD"
  dayOfWeek: DayOfWeekValue;
  /** Open windows in the tutor's configured timezone, HH:mm ranges. */
  slots: { startTime: string; endTime: string; serviceMode: string; capacity: number }[];
}

export interface PublicAvailabilityDto {
  tutorId: string;
  timezone: string;
  /** Inclusive UTC range boundaries requested. */
  rangeStartUtc: string;
  rangeEndUtc: string;
  days: PublicAvailabilityDayDto[];
  blackoutPeriods: { startAt: Date; endAt: Date; reason: string | null }[];
}

export function toWeeklySlotDto(r: TutorWeeklySlotRecord): TutorWeeklySlotDto {
  return {
    id: r.id,
    dayOfWeek: r.dayOfWeek,
    startTime: r.startTime,
    endTime: r.endTime,
    timezone: r.timezone,
    serviceMode: r.serviceMode,
    capacity: r.capacity,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function toBreakPeriodDto(r: TutorBreakPeriodRecord): TutorBreakPeriodDto {
  return {
    id: r.id,
    dayOfWeek: r.dayOfWeek,
    startTime: r.startTime,
    endTime: r.endTime,
    reason: r.reason,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function toBlackoutPeriodDto(r: TutorBlackoutPeriodRecord): TutorBlackoutPeriodDto {
  return {
    id: r.id,
    startAt: r.startAt,
    endAt: r.endAt,
    reason: r.reason,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}