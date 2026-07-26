import { describe, it, expect, vi } from "vitest";
import { UpdateStudentUseCase } from "./update-student.use-case.js";
import type { StudentRepository, ParentRepository } from "../index.js";

describe("UpdateStudentUseCase", () => {
  it("should update student and return updated DTO", async () => {
    const studentRepo: StudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "Old Name", dateOfBirth: null, gender: null, grade: null, curriculum: null, schoolName: null, learningGoals: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }),
      findByParentId: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "New Name", dateOfBirth: new Date("2015-01-01"), gender: "MALE", grade: 10, curriculum: "CBSE", schoolName: "ABC School", learningGoals: "Learn math", notes: "Some notes", createdAt: new Date(), updatedAt: new Date(), deletedAt: null }),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn().mockResolvedValue(true),
      createGuardianLink: vi.fn(),
    };
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue({ id: "parent-1", userId: "user-1", city: "Mumbai", preferredLanguage: "en", referralCode: null, createdAt: new Date(), updatedAt: new Date() }),
      updateByUserId: vi.fn(),
    };

    const useCase = new UpdateStudentUseCase(studentRepo, parentRepo);
    const result = await useCase.execute({
      studentId: "student-1",
      userId: "user-1",
      data: { fullName: "New Name", grade: 10, curriculum: "CBSE" },
    });

    expect(result.fullName).toBe("New Name");
    expect(result.grade).toBe(10);
    expect(studentRepo.update).toHaveBeenCalled();
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

    const useCase = new UpdateStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "nonexistent", userId: "user-1", data: { fullName: "New" } })).rejects.toThrow("User not found.");
  });

  it("should throw UserNotFoundError if student is deleted", async () => {
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

    const useCase = new UpdateStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "student-1", userId: "user-1", data: { fullName: "New" } })).rejects.toThrow("User not found.");
  });

  it("should throw UserNotFoundError if parent not found", async () => {
    const studentRepo: StudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "Test", dateOfBirth: null, gender: null, grade: null, curriculum: null, schoolName: null, learningGoals: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }),
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

    const useCase = new UpdateStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "student-1", userId: "nonexistent", data: { fullName: "New" } })).rejects.toThrow("User not found.");
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

    const useCase = new UpdateStudentUseCase(studentRepo, parentRepo);
    await expect(useCase.execute({ studentId: "student-1", userId: "user-1", data: { fullName: "New" } })).rejects.toThrow("User not found.");
  });
});