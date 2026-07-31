import { describe, it, expect, vi } from "vitest";
import { UpdateParentProfileUseCase } from "./update-parent-profile.use-case.js";
import type { ParentRepository } from "../index.js";

describe("UpdateParentProfileUseCase", () => {
  it("should update parent profile and return updated profile", async () => {
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue({
        id: "parent-1", userId: "user-1", city: "Mumbai", preferredLanguage: "en",
        referralCode: null, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01"),
      }),
      updateByUserId: vi.fn().mockResolvedValue({
        id: "parent-1", userId: "user-1", city: "Delhi", preferredLanguage: "hi",
        referralCode: null, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02"),
      }),
    };

    const useCase = new UpdateParentProfileUseCase(parentRepo);
    const result = await useCase.execute({
      userId: "user-1",
      data: { city: "Delhi", preferredLanguage: "hi" },
    });

    expect(result.city).toBe("Delhi");
    expect(result.preferredLanguage).toBe("hi");
    expect(parentRepo.updateByUserId).toHaveBeenCalledWith("user-1", { city: "Delhi", preferredLanguage: "hi" });
  });

  it("should throw UserNotFoundError if parent not found", async () => {
    const parentRepo: ParentRepository = {
      findByUserId: vi.fn().mockResolvedValue(null),
      updateByUserId: vi.fn(),
    };

    const useCase = new UpdateParentProfileUseCase(parentRepo);
    await expect(useCase.execute({ userId: "nonexistent", data: { city: "Delhi" } })).rejects.toThrow("User not found.");
  });
});