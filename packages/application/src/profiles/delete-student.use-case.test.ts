import { describe, it, expect, vi } from "vitest";
import { DeleteStudentUseCase } from "./delete-student.use-case.js";
import type { StudentRepository, ParentRepository } from "../index.js";

describe("DeleteStudentUseCase", () => {
  it("should soft delete a student", async () => {
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

    const useCase = new DeleteStudentUseCase(studentRepo, parentRepo);
    await useCase.execute({ studentId: "student-1", userId: "user-1" });

    expect(studentRepo.softDelete).toHaveBeenCalledWith("student-1");
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

    const useCase = new DeleteStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "nonexistent", userId: "user-1" })).rejects.toThrow("User not found.");
  });

  it("should throw UserNotFoundError if student already deleted", async () => {
    const studentRepo: StudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "Deleted", dateOfBirth: null, gender: null, grade: null, curriculum: null, schoolName: null, learningGoals: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: new Date() }),
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

    const useCase = new DeleteStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "student-1", userId: "user-1" })).rejects.toThrow("User not found.");
  });

  it("should throw UserNotFoundError if not the owner", async () => {
    const studentRepo: StudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "Test", dateOfBirth: null, gender: null, grade: null, curriculum: null, schoolName: null, learningGoals: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }),
      findByParentId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn().mockResolvedValue(false),
      createGuardianLink: vi.fn(),
    };
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue({ id: "parent-1", userId: "user-1", city: "Mumbai", preferredLanguage: "en", referralCode: null, createdAt: new Date(), updatedAt: new Date() }),
      updateByUserId: vi.fn(),
    };

    const useCase = new DeleteStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "student-1", userId: "user-1" })).rejects.toThrow("User not found.");
  });
});