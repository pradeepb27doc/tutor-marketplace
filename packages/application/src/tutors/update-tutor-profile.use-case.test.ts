import { describe, it, expect } from "vitest";
import { UpdateTutorProfileUseCase } from "./update-tutor-profile.use-case.js";
import {
  FakeTutorRepository,
  buildTutorRecord,
} from "@tutor-marketplace/testing";
import type { TutorRecord } from "../index.js";

function rawTutor(overrides: Partial<TutorRecord>): TutorRecord {
  const base = buildTutorRecord({ id: "tutor-x", userId: "user-x" });
  return {
    ...base,
    headline: null,
    bio: null,
    gender: null,
    city: null,
    locality: null,
    baseHourlyRate: null,
    experienceYears: 0,
    ...overrides,
  };
}

describe("UpdateTutorProfileUseCase", () => {
  it("should update provided fields and recompute completion score (all filled => 100)", async () => {
    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(
      rawTutor({ id: "tutor-1", userId: "user-1", headline: "H", bio: "B", gender: "MALE", city: "Mumbai", baseHourlyRate: "500.00", experienceYears: 5 }),
    );
    const useCase = new UpdateTutorProfileUseCase(tutorRepo);

    const result = await useCase.execute({ userId: "user-1", data: { headline: "Updated Headline" } });

    expect(result.headline).toBe("Updated Headline");
    expect(result.profileCompletionScore).toBe(100);
    expect(tutorRepo.tutors[0].headline).toBe("Updated Headline");
  });

  it("should compute a low score when most fields missing (only headline => 17)", async () => {
    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(
      rawTutor({ id: "tutor-2", userId: "user-2", headline: "Only headline", experienceYears: 0 }),
    );
    const useCase = new UpdateTutorProfileUseCase(tutorRepo);

    const result = await useCase.execute({ userId: "user-2", data: {} });

    expect(result.profileCompletionScore).toBe(17);
  });

  it("should throw if tutor profile not found", async () => {
    const tutorRepo = new FakeTutorRepository();
    const useCase = new UpdateTutorProfileUseCase(tutorRepo);

    await expect(
      useCase.execute({ userId: "nope", data: { headline: "x" } }),
    ).rejects.toThrow("Tutor profile not found");
  });
});