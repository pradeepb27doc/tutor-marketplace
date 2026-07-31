 import type { UseCase } from "../index.js";
import type { TutorRepository } from "./tutor.repository.js";
import type {
  TutorWeeklySlotRepository,
  TutorBreakPeriodRepository,
  TutorBlackoutPeriodRepository,
  DayOfWeekValue,
} from "./availability.repository.js";
import {
  toWeeklySlotDto,
  toBreakPeriodDto,
  toBlackoutPeriodDto,
  type TutorWeeklySlotDto,
  type TutorBreakPeriodDto,
  type TutorBlackoutPeriodDto,
  type UpdateWeeklySlotInput,
  type AddWeeklySlotInput,
  type AddBreakPeriodInput,
  type AddBlackoutPeriodInput,
  type WeeklyAvailabilityDto,
  type PublicAvailabilityDto,
  type PublicAvailabilityDayDto,
} from "./availability.dtos.js";

export class TutorNotFoundError extends Error {
  constructor() {
    super("Tutor profile not found");
    this.name = "TutorNotFoundError";
  }
}

export class WeeklySlotOwnershipError extends Error {
  constructor() {
    super("Weekly availability slot does not belong to this tutor");
    this.name = "WeeklySlotOwnershipError";
  }
}

export class SlotOverlapError extends Error {
  constructor() {
    super("Weekly slot overlaps an existing slot for the same day and service mode");
    this.name = "SlotOverlapError";
  }
}

export class InvalidTimeRangeError extends Error {
  constructor() {
    super("Start time must be strictly before end time");
    this.name = "InvalidTimeRangeError";
  }
}

const DAY_ORDER: DayOfWeekValue[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Returns true when two "HH:mm" ranges overlap (half-open [start, end)).
 * Pure business logic in the Application layer.
 */
function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function validateTimeRange(start: string, end: string): void {
  if (!TIME_RE.test(start) || !TIME_RE.test(end)) {
    throw new InvalidTimeRangeError();
  }
  if (start >= end) {
    throw new InvalidTimeRangeError();
  }
}

// --- Weekly slots ---

export class ListWeeklyAvailabilityUseCase
  implements UseCase<{ userId: string }, WeeklyAvailabilityDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly weeklySlotRepo: TutorWeeklySlotRepository,
    private readonly breakRepo: TutorBreakPeriodRepository,
  ) {}

  async execute(input: { userId: string }): Promise<WeeklyAvailabilityDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();
    const [slots, breaks] = await Promise.all([
      this.weeklySlotRepo.findByTutorId(tutor.id),
      this.breakRepo.findByTutorId(tutor.id),
    ]);
    return {
      weeklySlots: slots
        .sort(
          (a, b) =>
            DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) ||
            a.startTime.localeCompare(b.startTime),
        )
        .map(toWeeklySlotDto),
      breaks: breaks.map(toBreakPeriodDto),
    };
  }
}

export class AddWeeklySlotUseCase
  implements UseCase<{ userId: string; data: AddWeeklySlotInput }, TutorWeeklySlotDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly weeklySlotRepo: TutorWeeklySlotRepository,
  ) {}

  async execute(input: { userId: string; data: AddWeeklySlotInput }): Promise<TutorWeeklySlotDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();
    const { dayOfWeek, startTime, endTime, serviceMode, timezone, capacity } = input.data;
    validateTimeRange(startTime, endTime);

    const existing = await this.weeklySlotRepo.findOverlapping(tutor.id, dayOfWeek, serviceMode);
    const conflict = existing.find((s) => rangesOverlap(startTime, endTime, s.startTime, s.endTime));
    if (conflict) throw new SlotOverlapError();

    const record = await this.weeklySlotRepo.create({
      tutorId: tutor.id,
      dayOfWeek,
      startTime,
      endTime,
      serviceMode,
      timezone: timezone ?? "Asia/Kolkata",
      capacity: capacity ?? 1,
    });
    return toWeeklySlotDto(record);
  }
}

export class UpdateWeeklySlotUseCase
  implements UseCase<{ userId: string; slotId: string; data: UpdateWeeklySlotInput }, TutorWeeklySlotDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly weeklySlotRepo: TutorWeeklySlotRepository,
  ) {}

  async execute(input: {
    userId: string;
    slotId: string;
    data: UpdateWeeklySlotInput;
  }): Promise<TutorWeeklySlotDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();
    const existingSlot = await this.weeklySlotRepo.findById(input.slotId);
    if (!existingSlot || existingSlot.tutorId !== tutor.id) throw new WeeklySlotOwnershipError();

    const dayOfWeek = input.data.dayOfWeek ?? existingSlot.dayOfWeek;
    const serviceMode = input.data.serviceMode ?? existingSlot.serviceMode;
    const startTime = input.data.startTime ?? existingSlot.startTime;
    const endTime = input.data.endTime ?? existingSlot.endTime;
    validateTimeRange(startTime, endTime);

    const candidates = await this.weeklySlotRepo.findOverlapping(
      tutor.id,
      dayOfWeek,
      serviceMode,
      input.slotId,
    );
    const conflict = candidates.find((s) => rangesOverlap(startTime, endTime, s.startTime, s.endTime));
    if (conflict) throw new SlotOverlapError();

    const record = await this.weeklySlotRepo.update(input.slotId, {
      dayOfWeek,
      serviceMode,
      startTime,
      endTime,
      timezone: input.data.timezone,
      capacity: input.data.capacity,
    });
    return toWeeklySlotDto(record);
  }
}

export class RemoveWeeklySlotUseCase
  implements UseCase<{ userId: string; slotId: string }, void>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly weeklySlotRepo: TutorWeeklySlotRepository,
  ) {}

  async execute(input: { userId: string; slotId: string }): Promise<void> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();
    const existing = await this.weeklySlotRepo.findById(input.slotId);
    if (!existing || existing.tutorId !== tutor.id) throw new WeeklySlotOwnershipError();
    await this.weeklySlotRepo.delete(input.slotId);
  }
}

// --- Break periods ---

export class AddBreakPeriodUseCase
  implements UseCase<{ userId: string; data: AddBreakPeriodInput }, TutorBreakPeriodDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly breakRepo: TutorBreakPeriodRepository,
  ) {}

  async execute(input: { userId: string; data: AddBreakPeriodInput }): Promise<TutorBreakPeriodDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();
    const { dayOfWeek, startTime, endTime, reason } = input.data;
    validateTimeRange(startTime, endTime);
    const record = await this.breakRepo.create({
      tutorId: tutor.id,
      dayOfWeek: dayOfWeek ?? null,
      startTime,
      endTime,
      reason: reason ?? null,
    });
    return toBreakPeriodDto(record);
  }
}

export class RemoveBreakPeriodUseCase
  implements UseCase<{ userId: string; breakId: string }, void>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly breakRepo: TutorBreakPeriodRepository,
  ) {}

  async execute(input: { userId: string; breakId: string }): Promise<void> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();
    await this.breakRepo.delete(input.breakId);
  }
}

// --- Blackout (holiday / unavailable) periods ---

export class ListBlackoutPeriodsUseCase
  implements UseCase<{ userId: string }, TutorBlackoutPeriodDto[]>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly blackoutRepo: TutorBlackoutPeriodRepository,
  ) {}

  async execute(input: { userId: string }): Promise<TutorBlackoutPeriodDto[]> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();
    const records = await this.blackoutRepo.findByTutorId(tutor.id);
    return records.map(toBlackoutPeriodDto);
  }
}

export class AddBlackoutPeriodUseCase
  implements UseCase<{ userId: string; data: AddBlackoutPeriodInput }, TutorBlackoutPeriodDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly blackoutRepo: TutorBlackoutPeriodRepository,
  ) {}

  async execute(input: { userId: string; data: AddBlackoutPeriodInput }): Promise<TutorBlackoutPeriodDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();
    if (input.data.startAt >= input.data.endAt) throw new InvalidTimeRangeError();
    const record = await this.blackoutRepo.create({
      tutorId: tutor.id,
      startAt: input.data.startAt,
      endAt: input.data.endAt,
      reason: input.data.reason ?? null,
    });
    return toBlackoutPeriodDto(record);
  }
}

export class RemoveBlackoutPeriodUseCase
  implements UseCase<{ userId: string; blackoutId: string }, void>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly blackoutRepo: TutorBlackoutPeriodRepository,
  ) {}

  async execute(input: { userId: string; blackoutId: string }): Promise<void> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new TutorNotFoundError();
    await this.blackoutRepo.delete(input.blackoutId);
  }
}

// --- Public retrieval (booking-ready, no booking logic) ---

export class GetPublicAvailabilityUseCase
  implements UseCase<{ tutorId: string; from: Date; to: Date; timezone?: string }, PublicAvailabilityDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly weeklySlotRepo: TutorWeeklySlotRepository,
    private readonly breakRepo: TutorBreakPeriodRepository,
    private readonly blackoutRepo: TutorBlackoutPeriodRepository,
  ) {}

  async execute(input: {
    tutorId: string;
    from: Date;
    to: Date;
    timezone?: string;
  }): Promise<PublicAvailabilityDto> {
    const tutor = await this.tutorRepo.findById(input.tutorId);
    if (!tutor) throw new TutorNotFoundError();
    const timezone = input.timezone ?? "Asia/Kolkata";

    const [slots, breaks, blackouts] = await Promise.all([
      this.weeklySlotRepo.findByTutorId(tutor.id),
      this.breakRepo.findByTutorId(tutor.id),
      this.blackoutRepo.findByTutorId(tutor.id),
    ]);

    const days: PublicAvailabilityDayDto[] = [];
    const cursor = new Date(
      Date.UTC(input.from.getUTCFullYear(), input.from.getUTCMonth(), input.from.getUTCDate()),
    );
    const end = new Date(
      Date.UTC(input.to.getUTCFullYear(), input.to.getUTCMonth(), input.to.getUTCDate()),
    );
    while (cursor <= end) {
      const jsDay = cursor.getUTCDay(); // 0 = Sunday
      const dayOfWeek: DayOfWeekValue = jsDay === 0 ? "SUNDAY" : DAY_ORDER[jsDay - 1];
      const dateStr = cursor.toISOString().slice(0, 10);
      const daySlots = slots
        .filter((s) => s.dayOfWeek === dayOfWeek)
        .map((s) => {
          const applicableBreaks = breaks.filter(
            (b) => b.dayOfWeek === dayOfWeek || b.dayOfWeek === null,
          );
          let windows = [{ start: s.startTime, end: s.endTime }];
          for (const b of applicableBreaks) {
            const next: { start: string; end: string }[] = [];
            for (const w of windows) {
              if (b.endTime <= w.start || b.startTime >= w.end) {
                next.push(w);
                continue;
              }
              if (b.startTime > w.start) next.push({ start: w.start, end: b.startTime });
              if (b.endTime < w.end) next.push({ start: b.endTime, end: w.end });
            }
            windows = next;
          }
          return windows.map((w) => ({
            startTime: w.start,
            endTime: w.end,
            serviceMode: s.serviceMode,
            capacity: s.capacity,
          }));
        })
        .flat()
        .filter((w) => w.startTime < w.endTime);

      days.push({ date: dateStr, dayOfWeek, slots: daySlots });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return {
      tutorId: tutor.id,
      timezone,
      rangeStartUtc: input.from.toISOString(),
      rangeEndUtc: input.to.toISOString(),
      days,
      blackoutPeriods: blackouts.map((b) => ({ startAt: b.startAt, endAt: b.endAt, reason: b.reason })),
    };
  }
}
