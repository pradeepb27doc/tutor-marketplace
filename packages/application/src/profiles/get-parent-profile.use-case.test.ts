import { describe, it, expect, vi } from "vitest";
import { GetParentProfileUseCase } from "./get-parent-profile.use-case.js";
import type { ParentRepository } from "../index.js";

describe("GetParentProfileUseCase", () => {
  it("should return parent profile for the user", async () => {
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue({
        id: "parent-1", userId: "user-1", city: "Mumbai", preferredLanguage: "en",
        referralCode: "REF123", createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02"),
      }),
      updateByUserId: vi.fn(),
    };

    const useCase = new GetParentProfileUseCase(parentRepo);
    const result = await useCase.execute({ userId: "user-1" });

    expect(result.id).toBe("parent-1");
    expect(result.userId).toBe("user-1");
    expect(result.city).toBe("Mumbai");
    expect(result.preferredLanguage).toBe("en");
    expect(result.referralCode).toBe("REF123");
    expect(result.createdAt).toEqual(new Date("2026-01-01"));
    expect(result.updatedAt).toEqual(new Date("2026-01-02"));
  });

  it("should throw UserNotFoundError if parent not found", async () => {
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue(null),
      updateByUserId: vi.fn(),
    };

    const useCase = new GetParentProfileUseCase(parentRepo);
    await expect(useCase.execute({ userId: "nonexistent" })).rejects.toThrow("User not found.");
  });
});