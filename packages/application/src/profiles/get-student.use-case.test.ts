import { describe, it, expect, vi } from "vitest";
import { GetStudentUseCase } from "./get-student.use-case.js";
import type { StudentRepository, ParentRepository } from "../index.js";

describe("GetStudentUseCase", () => {
  it("should return student by id", async () => {
    const studentRepo: StudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "Test Student", dateOfBirth: new Date("2015-01-01"), gender: "MALE", grade: 10, curriculum: "CBSE", schoolName: "ABC School", learningGoals: "Learn math", notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }),
      findByParentId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn(),
      createGuardianLink: vi.fn(),
    };
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn(),
      updateByUserId: vi.fn(),
    };

    const useCase = new GetStudentUseCase(studentRepo, parentRepo);
    const result = await useCase.execute({ studentId: "student-1" });

    expect(result.id).toBe("student-1");
    expect(result.fullName).toBe("Test Student");
    expect(result.grade).toBe(10);
  });

  it("should throw UserNotFoundError if student not found", async () => {
    const studentRepo: StudentRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByParentId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn(),
      createGuardianLink: vi.fn(),
    };
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn(),
      updateByUserId: vi.fn(),
    };

    const useCase = new GetStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "nonexistent" })).rejects.toThrow("User not found.");
  });

  it("should throw UserNotFoundError if student is deleted", async () => {
    const studentRepo: StudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "Deleted Student", dateOfBirth: null, gender: null, grade: null, curriculum: null, schoolName: null, learningGoals: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: new Date() }),
      findByParentId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn(),
      createGuardianLink: vi.fn(),
    };
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn(),
      updateByUserId: vi.fn(),
    };

    const useCase = new GetStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "student-1" })).rejects.toThrow("User not found.");
  });

  it("should verify parent ownership when userId is provided", async () => {
    const studentRepo: StudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "Test Student", dateOfBirth: null, gender: null, grade: null, curriculum: null, schoolName: null, learningGoals: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }),
      findByParentId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn().mockResolvedValue(true),
      createGuardianLink: vi.fn(),
    };
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue({ id: "parent-1", userId: "user-1", city: "Mumbai", preferredLanguage: "en", referralCode: null, createdAt: new Date(), updatedAt: new Date() }),
      updateByUserId: vi.fn(),
    };

    const useCase = new GetStudentUseCase(studentRepo, parentRepo);
    const result = await useCase.execute({ studentId: "student-1", userId: "user-1" });

    expect(result.id).toBe("student-1");
    expect(studentRepo.verifyParentOwnership).toHaveBeenCalledWith("student-1", "parent-1");
  });

  it("should throw UserNotFoundError if parent not found during ownership check", async () => {
    const studentRepo: StudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "Test Student", dateOfBirth: null, gender: null, grade: null, curriculum: null, schoolName: null, learningGoals: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }),
      findByParentId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn(),
      createGuardianLink: vi.fn(),
    };
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue(null),
      updateByUserId: vi.fn(),
    };

    const useCase = new GetStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "student-1", userId: "user-1" })).rejects.toThrow("User not found.");
  });
});