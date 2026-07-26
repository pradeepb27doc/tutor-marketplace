import { describe, it, expect } from "vitest";
import {
  ListQualificationsUseCase,
  AddQualificationUseCase,
  UpdateQualificationUseCase,
  RemoveQualificationUseCase,
} from "./qualification.use-cases.js";
import {
  FakeTutorRepository,
  FakeTutorQualificationRepository,
  buildTutorRecord,
} from "@tutor-marketplace/testing";

function setup() {
  const tutorRepo = new FakeTutorRepository();
  tutorRepo.tutors.push(buildTutorRecord({ id: "tutor-1", userId: "user-1" }));
  const qualRepo = new FakeTutorQualificationRepository();
  return { tutorRepo, qualRepo };
}

describe("Qualification use cases", () => {
  it("AddQualification should create a qualification", async () => {
    const { tutorRepo, qualRepo } = setup();
    const useCase = new AddQualificationUseCase(tutorRepo, qualRepo);
    const result = await useCase.execute({
      userId: "user-1",
      data: { title: "B.Sc", institutionName: "XYZ", completionYear: 2015 },
    });
    expect(result.title).toBe("B.Sc");
    expect(qualRepo.records).toHaveLength(1);
  });

  it("AddQualification should throw if tutor not found", async () => {
    const { tutorRepo, qualRepo } = setup();
    const useCase = new AddQualificationUseCase(tutorRepo, qualRepo);
    await expect(
      useCase.execute({ userId: "nope", data: { title: "B.Sc" } }),
    ).rejects.toThrow("Tutor profile not found");
  });

  it("ListQualifications should return qualifications for tutor", async () => {
    const { tutorRepo, qualRepo } = setup();
    await qualRepo.create({ tutorId: "tutor-1", title: "B.Sc" });
    const useCase = new ListQualificationsUseCase(tutorRepo, qualRepo);
    const result = await useCase.execute({ userId: "user-1" });
    expect(result).toHaveLength(1);
  });

  it("UpdateQualification should update fields and ownership", async () => {
    const { tutorRepo, qualRepo } = setup();
    const created = await qualRepo.create({ tutorId: "tutor-1", title: "B.Sc" });
    const useCase = new UpdateQualificationUseCase(tutorRepo, qualRepo);
    const result = await useCase.execute({
      userId: "user-1",
      qualificationId: created.id,
      data: { title: "M.Sc" },
    });
    expect(result.title).toBe("M.Sc");
  });

  it("UpdateQualification should throw if qualification not found", async () => {
    const { tutorRepo, qualRepo } = setup();
    const useCase = new UpdateQualificationUseCase(tutorRepo, qualRepo);
    await expect(
      useCase.execute({ userId: "user-1", qualificationId: "missing", data: { title: "x" } }),
    ).rejects.toThrow("Qualification not found");
  });

  it("RemoveQualification should delete qualification", async () => {
    const { tutorRepo, qualRepo } = setup();
    const created = await qualRepo.create({ tutorId: "tutor-1", title: "B.Sc" });
    const useCase = new RemoveQualificationUseCase(tutorRepo, qualRepo);
    await useCase.execute({ userId: "user-1", qualificationId: created.id });
    expect(qualRepo.records).toHaveLength(0);
  });

  it("RemoveQualification should throw if ownership mismatch", async () => {
    const { tutorRepo, qualRepo } = setup();
    const other = await qualRepo.create({ tutorId: "tutor-other", title: "B.Sc" });
    const useCase = new RemoveQualificationUseCase(tutorRepo, qualRepo);
    await expect(
      useCase.execute({ userId: "user-1", qualificationId: other.id }),
    ).rejects.toThrow("Qualification not found");
  });
});