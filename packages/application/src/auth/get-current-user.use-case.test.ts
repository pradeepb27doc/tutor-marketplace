import { describe, it, expect, vi } from "vitest";
import { GetCurrentUserUseCase } from "./get-current-user.use-case.js";
import type { UserRepository, UserRoleRepository } from "../index.js";

describe("GetCurrentUserUseCase", () => {
  it("should return current user details", async () => {
    const userRepo: UserRepository = {
      findByEmail: vi.fn(),
      findByPhone: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "user-1", publicId: "pub-user-1", email: "test@example.com", phone: "+919999999999",
        passwordHash: null, displayName: "Test User", avatarUrl: "https://example.com/avatar.png",
        status: "ACTIVE", primaryRole: "PARENT", locale: "en-IN", timezone: "Asia/Kolkata",
        emailVerifiedAt: new Date(), phoneVerifiedAt: new Date(), lastLoginAt: new Date(),
        createdAt: new Date("2026-01-01"), updatedAt: new Date(), deletedAt: null,
      }),
      create: vi.fn(),
      update: vi.fn(),
    };
    const userRoleRepo: UserRoleRepository = {
      findByUserId: vi.fn().mockResolvedValue([{ id: "role-1", userId: "user-1", role: "PARENT" }]),
      assignRole: vi.fn(),
    };

    const useCase = new GetCurrentUserUseCase(userRepo, userRoleRepo);
    const result = await useCase.execute({ userId: "user-1" });

    expect(result.id).toBe("user-1");
    expect(result.displayName).toBe("Test User");
    expect(result.primaryRole).toBe("PARENT");
    expect(result.roles).toEqual(["PARENT"]);
    expect(result.status).toBe("ACTIVE");
    expect(result.email).toBe("test@example.com");
    expect(result.phone).toBe("+919999999999");
    expect(result.locale).toBe("en-IN");
    expect(result.timezone).toBe("Asia/Kolkata");
    expect(result.avatarUrl).toBe("https://example.com/avatar.png");
    expect(result.createdAt).toEqual(new Date("2026-01-01"));
  });

  it("should throw UserNotFoundError if user not found", async () => {
    const userRepo: UserRepository = {
      findByEmail: vi.fn(),
      findByPhone: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    };
    const userRoleRepo: UserRoleRepository = {
      findByUserId: vi.fn(),
      assignRole: vi.fn(),
    };

    const useCase = new GetCurrentUserUseCase(userRepo, userRoleRepo);
    await expect(useCase.execute({ userId: "nonexistent" })).rejects.toThrow("User not found.");
  });
});