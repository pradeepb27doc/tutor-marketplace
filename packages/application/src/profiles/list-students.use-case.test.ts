import { describe, it, expect, vi } from "vitest";
import { ListStudentsUseCase } from "./list-students.use-case.js";
import type { ParentRepository, StudentRepository, StudentRecord } from "../index.js";

describe("ListStudentsUseCase", () => {
  it("should list all students for the parent", async () => {
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue({ id: "parent-1", userId: "user-1", city: "Mumbai", preferredLanguage: "en", referralCode: null, createdAt: new Date(), updatedAt: new Date() }),
      updateByUserId: vi.fn(),
    };
    const students: StudentRecord[] = [
      { id: "student-1", userId: null, fullName: "John Doe", dateOfBirth: new Date("2015-01-01"), gender: "MALE", grade: 10, curriculum: "CBSE", schoolName: "ABC School", learningGoals: "Improve math", notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      { id: "student-2", userId: null, fullName: "Jane Doe", dateOfBirth: new Date("2017-06-15"), gender: "FEMALE", grade: 7, curriculum: "ICSE", schoolName: "XYZ School", learningGoals: null, notes: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    ];
    const studentRepo: StudentRepository = {
      findById: vi.fn(),
      findByParentId: vi.fn().mockResolvedValue(students),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn(),
      createGuardianLink: vi.fn(),
    };

    const useCase = new ListStudentsUseCase(parentRepo, studentRepo);
    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toHaveLength(2);
    expect(result[0].fullName).toBe("John Doe");
    expect(result[1].fullName).toBe("Jane Doe");
    expect(result[0].dateOfBirth).toBe("2015-01-01T00:00:00.000Z");
    expect(result[1].grade).toBe(7);
  });

  it("should return empty array if parent has no students", async () => {
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue({ id: "parent-1", userId: "user-1", city: "Mumbai", preferredLanguage: "en", referralCode: null, createdAt: new Date(), updatedAt: new Date() }),
      updateByUserId: vi.fn(),
    };
    const studentRepo: StudentRepository = {
      findById: vi.fn(),
      findByParentId: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      verifyParentOwnership: vi.fn(),
      createGuardianLink: vi.fn(),
    };

    const useCase = new ListStudentsUseCase(parentRepo, studentRepo);
    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toEqual([]);
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

    const useCase = new ListStudentsUseCase(parentRepo, studentRepo);
    await expect(useCase.execute({ userId: "nonexistent" })).rejects.toThrow("User not found.");
  });
});