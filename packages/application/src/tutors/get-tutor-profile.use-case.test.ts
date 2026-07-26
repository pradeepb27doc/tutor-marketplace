import { describe, it, expect } from "vitest";
import {
  GetMyTutorProfileUseCase,
  GetPublicTutorProfileUseCase,
} from "./get-tutor-profile.use-case.js";
import {
  FakeTutorRepository,
  FakeTutorSubjectRepository,
  FakeSubjectRepository,
  buildTutorRecord,
  buildSubjectRecord,
} from "@tutor-marketplace/testing";

describe("GetMyTutorProfileUseCase", () => {
  it("should return the tutor profile for the current user", async () => {
    const tutorRepo = new FakeTutorRepository();
    const tutor = buildTutorRecord({ id: "tutor-1", userId: "user-1", headline: "Math" });
    tutorRepo.tutors.push(tutor);
    const useCase = new GetMyTutorProfileUseCase(tutorRepo);

    const result = await useCase.execute({ userId: "user-1" });

    expect(result.id).toBe("tutor-1");
    expect(result.headline).toBe("Math");
    expect(result.userId).toBe("user-1");
  });

  it("should throw if no tutor profile exists", async () => {
    const tutorRepo = new FakeTutorRepository();
    const useCase = new GetMyTutorProfileUseCase(tutorRepo);

    await expect(useCase.execute({ userId: "nope" })).rejects.toThrow("Tutor profile not found");
  });
});

describe("GetPublicTutorProfileUseCase", () => {
  it("should return public profile with active subjects only", async () => {
    const subjectRepo = new FakeSubjectRepository();
    const math = buildSubjectRecord({ name: "Mathematics" });
    math.id = "math-1";
    math.slug = "mathematics";
    subjectRepo.subjects.push(math);
    const tutorSubjectRepo = new FakeTutorSubjectRepository(subjectRepo);
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
      subject: math,
    });

    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(buildTutorRecord({ id: "tutor-1", userId: "user-1", headline: "Math" }));
    const useCase = new GetPublicTutorProfileUseCase(tutorRepo, tutorSubjectRepo);

    const result = await useCase.execute({ tutorId: "tutor-1" });

    expect(result.id).toBe("tutor-1");
    expect(result.subjects).toHaveLength(1);
    expect(result.subjects[0].slug).toBe("mathematics");
  });

  it("should throw if tutor not found", async () => {
    const tutorRepo = new FakeTutorRepository();
    const subjectRepo = new FakeSubjectRepository();
    const useCase = new GetPublicTutorProfileUseCase(
      tutorRepo,
      new FakeTutorSubjectRepository(subjectRepo),
    );

    await expect(useCase.execute({ tutorId: "missing" })).rejects.toThrow("Tutor not found");
  });
});