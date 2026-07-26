import { describe, it, expect } from "vitest";
import { DashboardUseCase } from "./dashboard.use-case.js";
import {
  FakeTutorRepository,
  FakeTutorSubjectRepository,
  FakeSubjectRepository,
  buildTutorRecord,
} from "@tutor-marketplace/testing";

describe("DashboardUseCase", () => {
  it("should return a dashboard summary including active subject count", async () => {
    const subjectRepo = new FakeSubjectRepository();
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
    });
    tutorSubjectRepo.subjects.push({
      id: "ts-2",
      tutorId: "tutor-1",
      subjectId: "phys-1",
      gradeMin: null,
      gradeMax: null,
      hourlyRate: null,
      serviceModes: [],
      curricula: [],
      isActive: false,
      createdAt: new Date(),
    });

    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(
      buildTutorRecord({ id: "tutor-1", userId: "user-1", profileCompletionScore: 80, status: "ACTIVE" }),
    );
    const useCase = new DashboardUseCase(tutorRepo, tutorSubjectRepo);

    const result = await useCase.execute({ userId: "user-1" });

    expect(result.profileCompletionPercent).toBe(80);
    expect(result.activeSubjectCount).toBe(1);
    expect(result.status).toBe("ACTIVE");
  });

  it("should throw if tutor profile not found", async () => {
    const tutorRepo = new FakeTutorRepository();
    const subjectRepo = new FakeSubjectRepository();
    const useCase = new DashboardUseCase(tutorRepo, new FakeTutorSubjectRepository(subjectRepo));

    await expect(useCase.execute({ userId: "nope" })).rejects.toThrow("Tutor profile not found");
  });
});