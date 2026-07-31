import { describe, it, expect, vi } from "vitest";
import { RefreshTokenUseCase } from "./refresh-token.use-case.js";
import { FakeAuthTokensService, FakeClock } from "@tutor-marketplace/testing";
import type { SessionRepository, UserRepository, Clock, AuthTokensService } from "../index.js";

describe("RefreshTokenUseCase", () => {
  const createMocks = () => {
    const authTokensService: AuthTokensService = new FakeAuthTokensService();
    const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
    const sessionRepo: SessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByRefreshTokenHash: vi.fn(),
      listByUserId: vi.fn(),
      revoke: vi.fn(),
      revokeAllByUserId: vi.fn(),
    };
    const userRepo: UserRepository = {
      findByEmail: vi.fn(),
      findByPhone: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    return { authTokensService, clock, sessionRepo, userRepo };
  };

  it("should refresh tokens and rotate session", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.sessionRepo.findByRefreshTokenHash).mockResolvedValue({
      id: "session-1", userId: "user-1", refreshTokenHash: "hashed-fake-refresh-1-user-1",
      deviceId: null, ipAddress: null, userAgent: null,
      expiresAt: new Date("2026-08-14T00:00:00.000Z"), revokedAt: null, createdAt: new Date(),
    });
    vi.mocked(mocks.userRepo.findById).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: "test@example.com", phone: null,
      passwordHash: null, displayName: "Test", avatarUrl: null, status: "ACTIVE", primaryRole: "PARENT",
      locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: null, phoneVerifiedAt: null,
      lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new RefreshTokenUseCase(mocks.authTokensService, mocks.sessionRepo, mocks.userRepo, mocks.clock as Clock);
    const result = await useCase.execute({ refreshToken: "fake-refresh-1-user-1" });

    expect(result.accessToken).toContain("fake-access-");
    expect(result.refreshToken).toContain("fake-refresh-");
    expect(result.expiresInSeconds).toBe(900);
    expect(mocks.sessionRepo.revoke).toHaveBeenCalledWith("session-1");
    expect(mocks.sessionRepo.create).toHaveBeenCalled();
  });

  it("should throw InvalidTokenError if session not found", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.sessionRepo.findByRefreshTokenHash).mockResolvedValue(null);

    const useCase = new RefreshTokenUseCase(mocks.authTokensService, mocks.sessionRepo, mocks.userRepo, mocks.clock as Clock);
    await expect(useCase.execute({ refreshToken: "invalid-token" })).rejects.toThrow("Invalid or malformed token.");
  });

  it("should throw InvalidTokenError if session is revoked", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.sessionRepo.findByRefreshTokenHash).mockResolvedValue({
      id: "session-1", userId: "user-1", refreshTokenHash: "hash",
      deviceId: null, ipAddress: null, userAgent: null,
      expiresAt: new Date("2026-08-14"), revokedAt: new Date(), createdAt: new Date(),
    });

    const useCase = new RefreshTokenUseCase(mocks.authTokensService, mocks.sessionRepo, mocks.userRepo, mocks.clock as Clock);
    await expect(useCase.execute({ refreshToken: "revoked-token" })).rejects.toThrow("Invalid or malformed token.");
  });

  it("should throw SessionExpiredError if session expired and revoke it", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.sessionRepo.findByRefreshTokenHash).mockResolvedValue({
      id: "session-1", userId: "user-1", refreshTokenHash: "hash",
      deviceId: null, ipAddress: null, userAgent: null,
      expiresAt: new Date("2026-06-14"), revokedAt: null, createdAt: new Date(),
    });

    const useCase = new RefreshTokenUseCase(mocks.authTokensService, mocks.sessionRepo, mocks.userRepo, mocks.clock as Clock);
    await expect(useCase.execute({ refreshToken: "expired-token" })).rejects.toThrow("Session has expired");
    expect(mocks.sessionRepo.revoke).toHaveBeenCalledWith("session-1");
  });

  it("should throw UserNotFoundError if user does not exist for session", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.sessionRepo.findByRefreshTokenHash).mockResolvedValue({
      id: "session-1", userId: "nonexistent-user", refreshTokenHash: "hash",
      deviceId: null, ipAddress: null, userAgent: null,
      expiresAt: new Date("2026-08-14"), revokedAt: null, createdAt: new Date(),
    });
    vi.mocked(mocks.userRepo.findById).mockResolvedValue(null);

    const useCase = new RefreshTokenUseCase(mocks.authTokensService, mocks.sessionRepo, mocks.userRepo, mocks.clock as Clock);
    await expect(useCase.execute({ refreshToken: "some-token" })).rejects.toThrow("User not found.");
  });
});