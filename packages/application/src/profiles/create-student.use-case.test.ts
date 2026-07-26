import { describe, it, expect, vi } from "vitest";
import { CreateStudentUseCase } from "./create-student.use-case.js";
import type { ParentRepository, StudentRepository, StudentRecord } from "../index.js";

describe("CreateStudentUseCase", () => {
  it("should create a student and return student DTO", async () => {
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue({ id: "parent-1", userId: "user-1", city: "Mumbai", preferredLanguage: "en", referralCode: null, createdAt: new Date(), updatedAt: new Date() }),
      updateByUserId: vi.fn(),
    };
    const studentRepo: StudentRepository = {
      findById: vi.fn(),
      findByParentId: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: "student-1", userId: null, fullName: "New Student", dateOfBirth: new Date("2015-01-01"), gender: "MALE", grade: 10, curriculum: "CBSE", schoolName: "ABC School", learningGoals: "Learn math", notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn(),
      createGuardianLink: vi.fn(),
    };

    const useCase = new CreateStudentUseCase(parentRepo, studentRepo);
    const result = await useCase.execute({
      userId: "user-1",
      data: { fullName: "New Student", dateOfBirth: "2015-01-01", gender: "MALE", grade: 10, curriculum: "CBSE", schoolName: "ABC School", learningGoals: "Learn math" },
    });

    expect(result.id).toBe("student-1");
    expect(result.fullName).toBe("New Student");
    expect(result.grade).toBe(10);
    expect(studentRepo.create).toHaveBeenCalled();
    expect(studentRepo.createGuardianLink).toHaveBeenCalledWith("student-1", "parent-1", "parent");
  });

  it("should throw UserNotFoundError if parent not found", async () => {
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue(null),
      updateByUserId: vi.fn(),
    };
    const studentRepo: StudentRepository = {
      findById: vi.fn(),
      findByParentId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn(),
      createGuardianLink: vi.fn(),
    };

    const useCase = new CreateStudentUseCase(parentRepo, studentRepo);
    await expect(useCase.execute({ userId: "nonexistent", data: { fullName: "Student" } })).rejects.toThrow("User not found.");
  });

  it("should throw if student with same name already exists", async () => {
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue({ id: "parent-1", userId: "user-1", city: "Mumbai", preferredLanguage: "en", referralCode: null, createdAt: new Date(), updatedAt: new Date() }),
      updateByUserId: vi.fn(),
    };
    const existingStudents: StudentRecord[] = [
      { id: "student-1", userId: null, fullName: "Duplicate Student", dateOfBirth: null, gender: null, grade: null, curriculum: null, schoolName: null, learningGoals: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    ];
    const studentRepo: StudentRepository = {
      findById: vi.fn(),
      findByParentId: vi.fn().mockResolvedValue(existingStudents),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn(),
      createGuardianLink: vi.fn(),
    };

    const useCase = new CreateStudentUseCase(parentRepo, studentRepo);
    await expect(useCase.execute({ userId: "user-1", data: { fullName: "Duplicate Student" } })).rejects.toThrow("A student with this name already exists");
  });
});