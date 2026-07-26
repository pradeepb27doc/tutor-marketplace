import { describe, it, expect } from "vitest";
import {
  ListWeeklyAvailabilityUseCase,
  AddWeeklySlotUseCase,
  UpdateWeeklySlotUseCase,
  RemoveWeeklySlotUseCase,
  AddBreakPeriodUseCase,
  RemoveBreakPeriodUseCase,
  ListBlackoutPeriodsUseCase,
  AddBlackoutPeriodUseCase,
  RemoveBlackoutPeriodUseCase,
  GetPublicAvailabilityUseCase,
  TutorNotFoundError,
  WeeklySlotOwnershipError,
  SlotOverlapError,
  InvalidTimeRangeError,
} from "./availability.use-cases.js";
import {
  FakeTutorRepository,
  FakeTutorWeeklySlotRepository,
  FakeTutorBreakPeriodRepository,
  FakeTutorBlackoutPeriodRepository,
  buildTutorRecord,
} from "@tutor-marketplace/testing";

function setup() {
  const tutorRepo = new FakeTutorRepository();
  tutorRepo.tutors.push(buildTutorRecord({ id: "tutor-1", userId: "user-1" }));
  const weeklyRepo = new FakeTutorWeeklySlotRepository();
  const breakRepo = new FakeTutorBreakPeriodRepository();
  const blackoutRepo = new FakeTutorBlackoutPeriodRepository();
  return { tutorRepo, weeklyRepo, breakRepo, blackoutRepo };
}

describe("Weekly slot use cases", () => {
  it("ListWeeklyAvailability should return sorted slots and breaks", async () => {
    const { tutorRepo, weeklyRepo, breakRepo } = setup();
    await weeklyRepo.create({ tutorId: "tutor-1", dayOfWeek: "WEDNESDAY", startTime: "09:00", endTime: "10:00", serviceMode: "ONLINE" });
    await weeklyRepo.create({ tutorId: "tutor-1", dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", serviceMode: "ONLINE" });
    const useCase = new ListWeeklyAvailabilityUseCase(tutorRepo, weeklyRepo, breakRepo);
    const result = await useCase.execute({ userId: "user-1" });
    expect(result.weeklySlots[0].dayOfWeek).toBe("MONDAY");
    expect(result.weeklySlots[1].dayOfWeek).toBe("WEDNESDAY");
  });

  it("AddWeeklySlot should create a slot when no overlap", async () => {
    const { tutorRepo, weeklyRepo, breakRepo } = setup();
    const useCase = new AddWeeklySlotUseCase(tutorRepo, weeklyRepo);
    const result = await useCase.execute({
      userId: "user-1",
      data: { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", serviceMode: "ONLINE" },
    });
    expect(result.startTime).toBe("09:00");
    expect(weeklyRepo.slots).toHaveLength(1);
  });

  it("AddWeeklySlot should throw SlotOverlapError on overlapping range", async () => {
    const { tutorRepo, weeklyRepo } = setup();
    await weeklyRepo.create({ tutorId: "tutor-1", dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", serviceMode: "ONLINE" });
    const useCase = new AddWeeklySlotUseCase(tutorRepo, weeklyRepo);
    await expect(
      useCase.execute({ userId: "user-1", data: { dayOfWeek: "MONDAY", startTime: "09:30", endTime: "11:00", serviceMode: "ONLINE" } }),
    ).rejects.toThrow(SlotOverlapError);
  });

  it("AddWeeklySlot should throw InvalidTimeRangeError when start >= end", async () => {
    const { tutorRepo, weeklyRepo } = setup();
    const useCase = new AddWeeklySlotUseCase(tutorRepo, weeklyRepo);
    await expect(
      useCase.execute({ userId: "user-1", data: { dayOfWeek: "MONDAY", startTime: "10:00", endTime: "10:00", serviceMode: "ONLINE" } }),
    ).rejects.toThrow(InvalidTimeRangeError);
  });

  it("AddWeeklySlot should throw InvalidTimeRangeError on bad format", async () => {
    const { tutorRepo, weeklyRepo } = setup();
    const useCase = new AddWeeklySlotUseCase(tutorRepo, weeklyRepo);
    await expect(
      useCase.execute({ userId: "user-1", data: { dayOfWeek: "MONDAY", startTime: "9am", endTime: "10am", serviceMode: "ONLINE" } }),
    ).rejects.toThrow(InvalidTimeRangeError);
  });

  it("AddWeeklySlot should throw TutorNotFoundError when tutor missing", async () => {
    const { tutorRepo, weeklyRepo } = setup();
    const useCase = new AddWeeklySlotUseCase(tutorRepo, weeklyRepo);
    await expect(
      useCase.execute({ userId: "nope", data: { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", serviceMode: "ONLINE" } }),
    ).rejects.toThrow(TutorNotFoundError);
  });

  it("UpdateWeeklySlot should update without conflict", async () => {
    const { tutorRepo, weeklyRepo } = setup();
    const slot = await weeklyRepo.create({ tutorId: "tutor-1", dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", serviceMode: "ONLINE" });
    const useCase = new UpdateWeeklySlotUseCase(tutorRepo, weeklyRepo);
    const result = await useCase.execute({ userId: "user-1", slotId: slot.id, data: { startTime: "11:00", endTime: "12:00" } });
    expect(result.startTime).toBe("11:00");
  });

  it("UpdateWeeklySlot should throw WeeklySlotOwnershipError for non-owned slot", async () => {
    const { tutorRepo, weeklyRepo } = setup();
    const useCase = new UpdateWeeklySlotUseCase(tutorRepo, weeklyRepo);
    await expect(
      useCase.execute({ userId: "user-1", slotId: "missing", data: {} }),
    ).rejects.toThrow(WeeklySlotOwnershipError);
  });

  it("RemoveWeeklySlot should delete an owned slot", async () => {
    const { tutorRepo, weeklyRepo } = setup();
    const slot = await weeklyRepo.create({ tutorId: "tutor-1", dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", serviceMode: "ONLINE" });
    const useCase = new RemoveWeeklySlotUseCase(tutorRepo, weeklyRepo);
    await useCase.execute({ userId: "user-1", slotId: slot.id });
    expect(weeklyRepo.slots).toHaveLength(0);
  });

  it("RemoveWeeklySlot should throw WeeklySlotOwnershipError for non-owned slot", async () => {
    const { tutorRepo, weeklyRepo } = setup();
    const useCase = new RemoveWeeklySlotUseCase(tutorRepo, weeklyRepo);
    await expect(useCase.execute({ userId: "user-1", slotId: "missing" })).rejects.toThrow(WeeklySlotOwnershipError);
  });
});

describe("Break period use cases", () => {
  it("AddBreakPeriod should create a break", async () => {
    const { tutorRepo, breakRepo } = setup();
    const useCase = new AddBreakPeriodUseCase(tutorRepo, breakRepo);
    const result = await useCase.execute({ userId: "user-1", data: { dayOfWeek: "MONDAY", startTime: "12:00", endTime: "13:00", reason: "lunch" } });
    expect(result.startTime).toBe("12:00");
    expect(breakRepo.breaks).toHaveLength(1);
  });

  it("AddBreakPeriod should throw InvalidTimeRangeError on bad range", async () => {
    const { tutorRepo, breakRepo } = setup();
    const useCase = new AddBreakPeriodUseCase(tutorRepo, breakRepo);
    await expect(
      useCase.execute({ userId: "user-1", data: { startTime: "13:00", endTime: "12:00" } }),
    ).rejects.toThrow(InvalidTimeRangeError);
  });

  it("RemoveBreakPeriod should delete a break", async () => {
    const { tutorRepo, breakRepo } = setup();
    const b = await breakRepo.create({ tutorId: "tutor-1", startTime: "12:00", endTime: "13:00" });
    const useCase = new RemoveBreakPeriodUseCase(tutorRepo, breakRepo);
    await useCase.execute({ userId: "user-1", breakId: b.id });
    expect(breakRepo.breaks).toHaveLength(0);
  });

  it("RemoveBreakPeriod should throw TutorNotFoundError when tutor missing", async () => {
    const { tutorRepo, breakRepo } = setup();
    const useCase = new RemoveBreakPeriodUseCase(tutorRepo, breakRepo);
    await expect(useCase.execute({ userId: "nope", breakId: "x" })).rejects.toThrow(TutorNotFoundError);
  });
});

describe("Blackout period use cases", () => {
  it("AddBlackoutPeriod should create a blackout when start < end", async () => {
    const { tutorRepo, blackoutRepo } = setup();
    const useCase = new AddBlackoutPeriodUseCase(tutorRepo, blackoutRepo);
    const result = await useCase.execute({
      userId: "user-1",
      data: { startAt: new Date("2026-08-01T00:00:00Z"), endAt: new Date("2026-08-05T00:00:00Z"), reason: "vacation" },
    });
    expect(result.reason).toBe("vacation");
    expect(blackoutRepo.blackouts).toHaveLength(1);
  });

  it("AddBlackoutPeriod should throw InvalidTimeRangeError when start >= end", async () => {
    const { tutorRepo, blackoutRepo } = setup();
    const useCase = new AddBlackoutPeriodUseCase(tutorRepo, blackoutRepo);
    await expect(
      useCase.execute({ userId: "user-1", data: { startAt: new Date("2026-08-05T00:00:00Z"), endAt: new Date("2026-08-01T00:00:00Z") } }),
    ).rejects.toThrow(InvalidTimeRangeError);
  });

  it("ListBlackoutPeriods should return blackouts", async () => {
    const { tutorRepo, blackoutRepo } = setup();
    await blackoutRepo.create({ tutorId: "tutor-1", startAt: new Date("2026-08-01T00:00:00Z"), endAt: new Date("2026-08-05T00:00:00Z") });
    const useCase = new ListBlackoutPeriodsUseCase(tutorRepo, blackoutRepo);
    const result = await useCase.execute({ userId: "user-1" });
    expect(result).toHaveLength(1);
  });

  it("RemoveBlackoutPeriod should delete a blackout", async () => {
    const { tutorRepo, blackoutRepo } = setup();
    const b = await blackoutRepo.create({ tutorId: "tutor-1", startAt: new Date("2026-08-01T00:00:00Z"), endAt: new Date("2026-08-05T00:00:00Z") });
    const useCase = new RemoveBlackoutPeriodUseCase(tutorRepo, blackoutRepo);
    await useCase.execute({ userId: "user-1", blackoutId: b.id });
    expect(blackoutRepo.blackouts).toHaveLength(0);
  });
});

describe("GetPublicAvailabilityUseCase", () => {
  it("should build day windows accounting for breaks", async () => {
    const { tutorRepo, weeklyRepo, breakRepo, blackoutRepo } = setup();
    await weeklyRepo.create({ tutorId: "tutor-1", dayOfWeek: "MONDAY", startTime: "09:00", endTime: "12:00", serviceMode: "ONLINE", capacity: 1 });
    await breakRepo.create({ tutorId: "tutor-1", dayOfWeek: "MONDAY", startTime: "10:00", endTime: "11:00" });
    const useCase = new GetPublicAvailabilityUseCase(tutorRepo, weeklyRepo, breakRepo, blackoutRepo);

    const result = await useCase.execute({
      tutorId: "tutor-1",
      from: new Date("2026-07-20T00:00:00Z"), // Monday
      to: new Date("2026-07-20T00:00:00Z"),
    });

    const monday = result.days.find((d) => d.dayOfWeek === "MONDAY");
    expect(monday).toBeDefined();
    // Break splits 09-12 into 09-10 and 11-12
    expect(monday!.slots).toHaveLength(2);
    expect(monday!.slots[0]).toMatchObject({ startTime: "09:00", endTime: "10:00" });
    expect(monday!.slots[1]).toMatchObject({ startTime: "11:00", endTime: "12:00" });
  });

  it("should throw TutorNotFoundError when tutor missing", async () => {
    const { tutorRepo, weeklyRepo, breakRepo, blackoutRepo } = setup();
    const useCase = new GetPublicAvailabilityUseCase(tutorRepo, weeklyRepo, breakRepo, blackoutRepo);
    await expect(
      useCase.execute({ tutorId: "missing", from: new Date(), to: new Date() }),
    ).rejects.toThrow(TutorNotFoundError);
  });
});