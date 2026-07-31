import { describe, it, expect } from "vitest";
import { GetPublicTutorDetailUseCase } from "./get-tutor-detail.use-case.js";
import {
  FakeTutorRepository,
  FakeTutorSubjectRepository,
  FakeSubjectRepository,
  FakeTutorQualificationRepository,
  FakeTutorLanguageRepository,
  FakeTutorServiceAreaRepository,
  FakeTutorVerificationRepository,
  FakeUserRepository,
  buildTutorRecord,
  buildSubjectRecord,
} from "@tutor-marketplace/testing";
import type { VerificationCheckRecord } from "../index.js";

function makeApprovedCheck(type: VerificationCheckRecord["type"]): VerificationCheckRecord {
  return {
    id: `vc-${type}`,
    tutorId: "tutor-1",
    type,
    status: "APPROVED",
    submittedAt: new Date(),
    reviewedByUserId: "admin-1",
    reviewedAt: new Date(),
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function setup(opts: { status?: string; checks?: VerificationCheckRecord[] } = {}) {
  const subjectRepo = new FakeSubjectRepository();
  const math = buildSubjectRecord({ name: "Mathematics" });
  math.id = "math-1";
  math.slug = "mathematics";
  subjectRepo.subjects.push(math);

  const tutorRepo = new FakeTutorRepository();
  const tutor = buildTutorRecord({ id: "tutor-1", userId: "user-1", headline: "Math", bio: "B" });
  tutor.status = opts.status ?? "ACTIVE";
  tutorRepo.tutors.push(tutor);

  const tutorSubjectRepo = new FakeTutorSubjectRepository(subjectRepo);
  tutorSubjectRepo.subjects.push({
    id: "ts-1",
    tutorId: "tutor-1",
    subjectId: "math-1",
    gradeMin: null,
    gradeMax: null,
    hourlyRate: null,
    serviceModes: ["ONLINE"],
    curricula: ["CBSE"],
    isActive: true,
    createdAt: new Date(),
    subject: math,
  });

  const qualRepo = new FakeTutorQualificationRepository();
  const langRepo = new FakeTutorLanguageRepository();
  const areaRepo = new FakeTutorServiceAreaRepository();
  const verificationRepo = new FakeTutorVerificationRepository();
  if (opts.checks) verificationRepo.checks.push(...opts.checks);

  const userRepo = new FakeUserRepository();
  userRepo.users.push({
    id: "user-1",
    publicId: "pub-1",
    email: "t@e.com",
    phone: null,
    passwordHash: null,
    displayName: "Tutor Name",
    avatarUrl: null,
    status: "ACTIVE",
    primaryRole: "TUTOR",
    locale: "en-IN",
    timezone: "Asia/Kolkata",
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const useCase = new GetPublicTutorDetailUseCase(
    tutorRepo,
    tutorSubjectRepo,
    qualRepo,
    langRepo,
    areaRepo,
    verificationRepo,
    userRepo,
  );
  return { useCase };
}

describe("GetPublicTutorDetailUseCase", () => {
  it("should return full tutor detail with isVerified true when all required checks approved", async () => {
    const { useCase } = setup({
      checks: [makeApprovedCheck("GOVERNMENT_ID"), makeApprovedCheck("DEGREE"), makeApprovedCheck("EXPERIENCE")],
    });
    const result = await useCase.execute({ tutorId: "tutor-1" });
    expect(result.id).toBe("tutor-1");
    expect(result.displayName).toBe("Tutor Name");
    expect(result.isVerified).toBe(true);
    expect(result.subjects).toHaveLength(1);
    expect(result.subjects[0].subjectName).toBe("Mathematics");
    expect(result.verification.isVerified).toBe(true);
  });

  it("should report isVerified false when a required check is missing", async () => {
    const { useCase } = setup({ checks: [makeApprovedCheck("GOVERNMENT_ID")] });
    const result = await useCase.execute({ tutorId: "tutor-1" });
    expect(result.isVerified).toBe(false);
  });

  it("should throw if tutor not found", async () => {
    const { useCase } = setup();
    await expect(useCase.execute({ tutorId: "missing" })).rejects.toThrow("Tutor not found");
  });

  it("should throw if tutor is not ACTIVE", async () => {
    const { useCase } = setup({ status: "PENDING_VERIFICATION" });
    await expect(useCase.execute({ tutorId: "tutor-1" })).rejects.toThrow("Tutor not found");
  });
});