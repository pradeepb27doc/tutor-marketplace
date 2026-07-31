import { describe, it, expect } from "vitest";
import {
  AddTutorSubjectUseCase,
  RemoveTutorSubjectUseCase,
  ListTutorSubjectsUseCase,
} from "./tutor-subject.use-cases.js";
import {
  FakeTutorRepository,
  FakeTutorSubjectRepository,
  FakeSubjectRepository,
  buildTutorRecord,
  buildSubjectRecord,
} from "@tutor-marketplace/testing";

function setup() {
  const subjectRepo = new FakeSubjectRepository();
  const math = buildSubjectRecord({ name: "Mathematics" });
  math.id = "math-1";
  math.slug = "mathematics";
  subjectRepo.subjects.push(math);
  const tutorRepo = new FakeTutorRepository();
  tutorRepo.tutors.push(buildTutorRecord({ id: "tutor-1", userId: "user-1" }));
  const tutorSubjectRepo = new FakeTutorSubjectRepository(subjectRepo);
  return { subjectRepo, tutorRepo, tutorSubjectRepo, math };
}

describe("AddTutorSubjectUseCase", () => {
  it("should add a subject to the tutor profile", async () => {
    const { subjectRepo, tutorRepo, tutorSubjectRepo, math } = setup();
    const useCase = new AddTutorSubjectUseCase(tutorRepo, subjectRepo, tutorSubjectRepo);

    const result = await useCase.execute({ userId: "user-1", data: { subjectId: "math-1" } });

    expect(result.subjectId).toBe("math-1");
    expect(result.subjectName).toBe("Mathematics");
    expect(tutorSubjectRepo.subjects).toHaveLength(1);
  });

  it("should throw if tutor profile not found", async () => {
    const { subjectRepo, tutorRepo, tutorSubjectRepo } = setup();
    const useCase = new AddTutorSubjectUseCase(tutorRepo, subjectRepo, tutorSubjectRepo);

    await expect(
      useCase.execute({ userId: "nope", data: { subjectId: "math-1" } }),
    ).rejects.toThrow("Tutor profile not found");
  });

  it("should throw if subject not found", async () => {
    const { subjectRepo, tutorRepo, tutorSubjectRepo } = setup();
    const useCase = new AddTutorSubjectUseCase(tutorRepo, subjectRepo, tutorSubjectRepo);

    await expect(
      useCase.execute({ userId: "user-1", data: { subjectId: "missing" } }),
    ).rejects.toThrow("Subject not found");
  });

  it("should throw if subject already added and active", async () => {
    const { subjectRepo, tutorRepo, tutorSubjectRepo, math } = setup();
    tutorSubjectRepo.subjects.push({
      id: "ts-1",
      tutorId: "tutor-1",
      subjectId: "math-1",
      gradeMin: null,
      gradeMax: null,
      hourlyRate: null,
      serviceModes: [],
      curricula: [],
      isActive: true,
      createdAt: new Date(),
      subject: math,
    });
    const useCase = new AddTutorSubjectUseCase(tutorRepo, subjectRepo, tutorSubjectRepo);

    await expect(
      useCase.execute({ userId: "user-1", data: { subjectId: "math-1" } }),
    ).rejects.toThrow("Subject already added");
  });
});

describe("RemoveTutorSubjectUseCase", () => {
  it("should remove (soft delete) a tutor subject", async () => {
    const { subjectRepo, tutorRepo, tutorSubjectRepo } = setup();
    tutorSubjectRepo.subjects.push({
      id: "ts-1",
      tutorId: "tutor-1",
      subjectId: "math-1",
      gradeMin: null,
      gradeMax: null,
      hourlyRate: null,
      serviceModes: [],
      curricula: [],
      isActive: true,
      createdAt: new Date(),
    });
    const useCase = new RemoveTutorSubjectUseCase(tutorRepo, tutorSubjectRepo);

    await useCase.execute({ userId: "user-1", tutorSubjectId: "ts-1" });

    expect(tutorSubjectRepo.subjects).toHaveLength(0);
  });

  it("should throw if subject not found or not owned by tutor", async () => {
    const { subjectRepo, tutorRepo, tutorSubjectRepo } = setup();
    const useCase = new RemoveTutorSubjectUseCase(tutorRepo, tutorSubjectRepo);

    await expect(
      useCase.execute({ userId: "user-1", tutorSubjectId: "ts-missing" }),
    ).rejects.toThrow("Subject not found");
  });
});

describe("ListTutorSubjectsUseCase", () => {
  it("should list only active subjects", async () => {
    const { subjectRepo, tutorRepo, tutorSubjectRepo } = setup();
    tutorSubjectRepo.subjects.push({
      id: "ts-1",
      tutorId: "tutor-1",
      subjectId: "math-1",
      gradeMin: null,
      gradeMax: null,
      hourlyRate: null,
      serviceModes: [],
      curricula: [],
      isActive: true,
      createdAt: new Date(),
    });
    tutorSubjectRepo.subjects.push({
      id: "ts-2",
      tutorId: "tutor-1",
      subjectId: "math-1",
      gradeMin: null,
      gradeMax: null,
      hourlyRate: null,
      serviceModes: [],
      curricula: [],
      isActive: false,
      createdAt: new Date(),
    });
    const useCase = new ListTutorSubjectsUseCase(tutorRepo, tutorSubjectRepo);

    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toHaveLength(1);
  });

  it("should throw if tutor profile not found", async () => {
    const { subjectRepo, tutorRepo, tutorSubjectRepo } = setup();
    const useCase = new ListTutorSubjectsUseCase(tutorRepo, tutorSubjectRepo);

    await expect(useCase.execute({ userId: "nope" })).rejects.toThrow("Tutor profile not found");
  });
});