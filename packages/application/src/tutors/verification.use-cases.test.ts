import { describe, it, expect } from "vitest";
import {
  GetVerificationStatusUseCase,
  UploadVerificationDocumentUseCase,
  SubmitVerificationUseCase,
  ListVerificationCasesUseCase,
  GetVerificationCaseUseCase,
  ApproveVerificationUseCase,
  RejectVerificationUseCase,
  RequestChangesVerificationUseCase,
} from "./verification.use-cases.js";
import {
  FakeTutorRepository,
  FakeTutorVerificationRepository,
  FakeUserRepository,
  FakeClock,
  buildTutorRecord,
} from "@tutor-marketplace/testing";
import { REQUIRED_VERIFICATION_TYPES } from "./verification.repository.js";
import type { VerificationCaseSummaryRecord } from "./verification.repository.js";
import type { TutorRecord } from "../index.js";

function pendingTutor(id: string, userId: string): TutorRecord {
  const base = buildTutorRecord({ id, userId });
  return { ...base, status: "PENDING_VERIFICATION" };
}

function tutorSummary(status: string): VerificationCaseSummaryRecord {
  return {
    tutor: { id: "tutor-1", userId: "user-1", status, city: "Mumbai", headline: "H", createdAt: new Date() },
    checks: [],
  };
}

describe("GetVerificationStatusUseCase", () => {
  it("should include all required types even when absent", async () => {
    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(pendingTutor("tutor-1", "user-1"));
    const verificationRepo = new FakeTutorVerificationRepository();
    const useCase = new GetVerificationStatusUseCase(tutorRepo, verificationRepo);
    const result = await useCase.execute({ userId: "user-1" });
    expect(result.tutorId).toBe("tutor-1");
    expect(result.status).toBe("PENDING_VERIFICATION");
    expect(result.checks).toHaveLength(REQUIRED_VERIFICATION_TYPES.length);
    expect(result.checks.every((c) => c.status === "NOT_SUBMITTED")).toBe(true);
  });

  it("should throw if tutor not found", async () => {
    const tutorRepo = new FakeTutorRepository();
    const verificationRepo = new FakeTutorVerificationRepository();
    const useCase = new GetVerificationStatusUseCase(tutorRepo, verificationRepo);
    await expect(useCase.execute({ userId: "nope" })).rejects.toThrow("Tutor profile not found");
  });
});

describe("UploadVerificationDocumentUseCase", () => {
  it("should upsert a check and create a document", async () => {
    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(pendingTutor("tutor-1", "user-1"));
    const verificationRepo = new FakeTutorVerificationRepository();
    const useCase = new UploadVerificationDocumentUseCase(tutorRepo, verificationRepo);
    const result = await useCase.execute({
      userId: "user-1",
      data: { type: "GOVERNMENT_ID", fileKey: "key1", originalFileName: "id.png" },
    });
    expect(result.fileKey).toBe("key1");
    expect(verificationRepo.checks).toHaveLength(1);
    expect(verificationRepo.checks[0].status).toBe("SUBMITTED");
  });

  it("should throw if tutor already ACTIVE", async () => {
    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(buildTutorRecord({ id: "tutor-1", userId: "user-1", status: "ACTIVE" }));
    const verificationRepo = new FakeTutorVerificationRepository();
    const useCase = new UploadVerificationDocumentUseCase(tutorRepo, verificationRepo);
    await expect(
      useCase.execute({ userId: "user-1", data: { type: "GOVERNMENT_ID", fileKey: "k" } }),
    ).rejects.toThrow("Tutor is already verified and active");
  });
});

describe("SubmitVerificationUseCase", () => {
  it("should submit and set PENDING_VERIFICATION when all docs present", async () => {
    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(pendingTutor("tutor-1", "user-1"));
    const verificationRepo = new FakeTutorVerificationRepository();
    for (const t of REQUIRED_VERIFICATION_TYPES) {
      await verificationRepo.createDocument({ tutorId: "tutor-1", verificationCheckId: null, type: t, fileKey: "k" });
    }
    const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
    const useCase = new SubmitVerificationUseCase(tutorRepo, verificationRepo, clock);
    const result = await useCase.execute({ userId: "user-1" });
    expect(result.status).toBe("PENDING_VERIFICATION");
    expect(tutorRepo.tutors[0].status).toBe("PENDING_VERIFICATION");
  });

  it("should throw when required documents are missing", async () => {
    const tutorRepo = new FakeTutorRepository();
    tutorRepo.tutors.push(pendingTutor("tutor-1", "user-1"));
    const verificationRepo = new FakeTutorVerificationRepository();
    const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
    const useCase = new SubmitVerificationUseCase(tutorRepo, verificationRepo, clock);
    await expect(useCase.execute({ userId: "user-1" })).rejects.toThrow(/Missing documents/);
  });
});

describe("Admin verification use cases", () => {
  it("ListVerificationCases should cap limit and report hasMore", async () => {
    const verificationRepo = new FakeTutorVerificationRepository();
    verificationRepo.cases = [tutorSummary("PENDING_VERIFICATION"), tutorSummary("PENDING_VERIFICATION")];
    const useCase = new ListVerificationCasesUseCase(verificationRepo);
    const result = await useCase.execute({ limit: 1 });
    expect(result.data).toHaveLength(1);
    expect(result.page.hasMore).toBe(true);
    expect(result.page.nextCursor).toBe("cursor");
  });

  it("GetVerificationCase should return the case", async () => {
    const verificationRepo = new FakeTutorVerificationRepository();
    verificationRepo.cases = [tutorSummary("PENDING_VERIFICATION")];
    const useCase = new GetVerificationCaseUseCase(verificationRepo);
    const result = await useCase.execute({ tutorId: "tutor-1" });
    expect(result.tutorId).toBe("tutor-1");
  });

  it("GetVerificationCase should throw if case not found", async () => {
    const verificationRepo = new FakeTutorVerificationRepository();
    const useCase = new GetVerificationCaseUseCase(verificationRepo);
    await expect(useCase.execute({ tutorId: "missing" })).rejects.toThrow("Verification case not found");
  });

  it("ApproveVerification should activate the tutor", async () => {
    const verificationRepo = new FakeTutorVerificationRepository();
    verificationRepo.cases = [tutorSummary("PENDING_VERIFICATION")];
    const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
    const useCase = new ApproveVerificationUseCase(verificationRepo, clock);
    const result = await useCase.execute({ tutorId: "tutor-1", reviewerUserId: "admin-1" });
    expect(result.status).toBe("ACTIVE");
    expect(verificationRepo.cases[0].tutor.status).toBe("ACTIVE");
  });

  it("RejectVerification should set REJECTED status", async () => {
    const verificationRepo = new FakeTutorVerificationRepository();
    verificationRepo.cases = [tutorSummary("PENDING_VERIFICATION")];
    const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
    const useCase = new RejectVerificationUseCase(verificationRepo, clock);
    const result = await useCase.execute({ tutorId: "tutor-1", reviewerUserId: "admin-1", rejectionReason: "bad" });
    expect(result.status).toBe("REJECTED");
    expect(verificationRepo.cases[0].tutor.status).toBe("REJECTED");
  });

  it("RequestChangesVerification should set CHANGES_REQUESTED status", async () => {
    const verificationRepo = new FakeTutorVerificationRepository();
    verificationRepo.cases = [tutorSummary("PENDING_VERIFICATION")];
    const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
    const useCase = new RequestChangesVerificationUseCase(verificationRepo, clock);
    const result = await useCase.execute({ tutorId: "tutor-1", reviewerUserId: "admin-1", note: "fix" });
    expect(result.status).toBe("CHANGES_REQUESTED");
    expect(verificationRepo.cases[0].tutor.status).toBe("CHANGES_REQUESTED");
  });
});