import { describe, it, expect, vi } from "vitest";
import { LogoutUseCase } from "./logout.use-case.js";
import type { SessionRepository } from "../index.js";

describe("LogoutUseCase", () => {
  it("should revoke session if it exists and belongs to user", async () => {
    const sessionRepo: SessionRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "session-1", userId: "user-1", refreshTokenHash: "hash", deviceId: null, ipAddress: null, userAgent: null, expiresAt: new Date(), revokedAt: null, createdAt: new Date() }),
      findByRefreshTokenHash: vi.fn(),
      listByUserId: vi.fn(),
      revoke: vi.fn(),
      revokeAllByUserId: vi.fn(),
    };

    const useCase = new LogoutUseCase(sessionRepo);
    await useCase.execute({ sessionId: "session-1", userId: "user-1" });

    expect(sessionRepo.revoke).toHaveBeenCalledWith("session-1");
  });

  it("should silently succeed if session does not exist", async () => {
    const sessionRepo: SessionRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByRefreshTokenHash: vi.fn(),
      listByUserId: vi.fn(),
      revoke: vi.fn(),
      revokeAllByUserId: vi.fn(),
    };

    const useCase = new LogoutUseCase(sessionRepo);
    await expect(useCase.execute({ sessionId: "nonexistent", userId: "user-1" })).resolves.toBeUndefined();
    expect(sessionRepo.revoke).not.toHaveBeenCalled();
  });

  it("should silently succeed if session belongs to another user", async () => {
    const sessionRepo: SessionRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "session-1", userId: "other-user", refreshTokenHash: "hash", deviceId: null, ipAddress: null, userAgent: null, expiresAt: new Date(), revokedAt: null, createdAt: new Date() }),
      findByRefreshTokenHash: vi.fn(),
      listByUserId: vi.fn(),
      revoke: vi.fn(),
      revokeAllByUserId: vi.fn(),
    };

    const useCase = new LogoutUseCase(sessionRepo);
    await useCase.execute({ sessionId: "session-1", userId: "user-1" });
    expect(sessionRepo.revoke).not.toHaveBeenCalled();
  });
});