import { describe, it, expect } from "vitest";
import { CreateTutorProfileUseCase } from "./create-tutor-profile.use-case.js";
import { FakeTutorRepository, FakeUserRoleRepository, buildTutorRecord } from "@tutor-marketplace/testing";

describe("CreateTutorProfileUseCase", () => {
  it("should create a tutor profile and assign TUTOR role", async () => {
    const tutorRepo = new FakeTutorRepository();
    const userRoleRepo = new FakeUserRoleRepository();
    const useCase = new CreateTutorProfileUseCase(tutorRepo, userRoleRepo);

    const result = await useCase.execute({
      userId: "user-1",
      data: { headline: "Expert Math Tutor", city: "Mumbai", experienceYears: 5 },
    });

    expect(result.userId).toBe("user-1");
    expect(result.headline).toBe("Expert Math Tutor");
    expect(result.city).toBe("Mumbai");
    expect(tutorRepo.tutors).toHaveLength(1);
    expect(userRoleRepo.roles).toHaveLength(1);
    expect(userRoleRepo.roles[0]).toMatchObject({ userId: "user-1", role: "TUTOR" });
  });

  it("should default optional fields to null/zero", async () => {
    const tutorRepo = new FakeTutorRepository();
    const userRoleRepo = new FakeUserRoleRepository();
    const useCase = new CreateTutorProfileUseCase(tutorRepo, userRoleRepo);

    const result = await useCase.execute({ userId: "user-2", data: {} });

    expect(result.headline).toBeNull();
    expect(result.bio).toBeNull();
    expect(result.experienceYears).toBe(0);
  });

  it("should throw if a tutor profile already exists for the user", async () => {
    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(buildTutorRecord({ id: "tutor-existing", userId: "user-1" }));
    const userRoleRepo = new FakeUserRoleRepository();
    const useCase = new CreateTutorProfileUseCase(tutorRepo, userRoleRepo);

    await expect(
      useCase.execute({ userId: "user-1", data: { headline: "x" } }),
    ).rejects.toThrow("Tutor profile already exists for this user");
  });
});