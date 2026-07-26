import { describe, it, expect, vi } from "vitest";
import { LoginUseCase } from "./login.use-case.js";
import { FakePasswordService, FakeAuthTokensService, FakeClock } from "@tutor-marketplace/testing";
import type { UserRepository, UserRoleRepository, SessionRepository, Clock, AuthTokensService } from "../index.js";

describe("LoginUseCase", () => {
  const createMocks = () => {
    const passwordService = new FakePasswordService();
    const authTokensService: AuthTokensService = new FakeAuthTokensService();
    const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
    const userRepo: UserRepository = {
      findByEmail: vi.fn(),
      findByPhone: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    const userRoleRepo: UserRoleRepository = {
      findByUserId: vi.fn().mockResolvedValue([{ id: "role-1", userId: "user-1", role: "PARENT" }]),
      assignRole: vi.fn(),
    };
    const sessionRepo: SessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByRefreshTokenHash: vi.fn(),
      listByUserId: vi.fn(),
      revoke: vi.fn(),
      revokeAllByUserId: vi.fn(),
    };

    return { passwordService, authTokensService, clock, userRepo, userRoleRepo, sessionRepo };
  };

  it("should login with valid email and password", async () => {
    const mocks = createMocks();
    const passwordHash = await mocks.passwordService.hash("valid-password");
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: "test@example.com", phone: null,
      passwordHash, displayName: "Test User", avatarUrl: null, status: "ACTIVE", primaryRole: "PARENT",
      locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: new Date(), phoneVerifiedAt: null,
      lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new LoginUseCase(mocks.passwordService, mocks.authTokensService, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);
    const result = await useCase.execute({ email: "test@example.com", password: "valid-password" });

    expect(result.accessToken).toContain("fake-access-");
    expect(result.refreshToken).toContain("fake-refresh-");
    expect(result.expiresInSeconds).toBe(900);
    expect(result.user.id).toBe("user-1");
    expect(result.user.displayName).toBe("Test User");
    expect(mocks.userRepo.update).toHaveBeenCalledWith("user-1", expect.objectContaining({ lastLoginAt: expect.any(Date) }));
  });

  it("should throw InvalidCredentialsError if user not found", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(null);

    const useCase = new LoginUseCase(mocks.passwordService, mocks.authTokensService, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);
    await expect(useCase.execute({ email: "unknown@example.com", password: "password" })).rejects.toThrow("Invalid email or password");
  });

  it("should throw InvalidCredentialsError if user has no passwordHash", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: "test@example.com", phone: null,
      passwordHash: null, displayName: "Test", avatarUrl: null, status: "ACTIVE", primaryRole: "PARENT",
      locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: null, phoneVerifiedAt: null,
      lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new LoginUseCase(mocks.passwordService, mocks.authTokensService, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);
    await expect(useCase.execute({ email: "test@example.com", password: "password" })).rejects.toThrow("Invalid email or password");
  });

  it("should throw InvalidCredentialsError if password is wrong", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: "test@example.com", phone: null,
      passwordHash: "fake-hash-correct-password", displayName: "Test", avatarUrl: null, status: "ACTIVE", primaryRole: "PARENT",
      locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: null, phoneVerifiedAt: null,
      lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new LoginUseCase(mocks.passwordService, mocks.authTokensService, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);
    await expect(useCase.execute({ email: "test@example.com", password: "wrong-password" })).rejects.toThrow("Invalid email or password");
  });

  it("should throw UserSuspendedError if user is suspended", async () => {
    const mocks = createMocks();
    const passwordHash = await mocks.passwordService.hash("valid-password");
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: "test@example.com", phone: null,
      passwordHash, displayName: "Test", avatarUrl: null, status: "SUSPENDED", primaryRole: "PARENT",
      locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: null, phoneVerifiedAt: null,
      lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new LoginUseCase(mocks.passwordService, mocks.authTokensService, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);
    await expect(useCase.execute({ email: "test@example.com", password: "valid-password" })).rejects.toThrow("Account is suspended");
  });

  it("should create session on successful login", async () => {
    const mocks = createMocks();
    const passwordHash = await mocks.passwordService.hash("valid-password");
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: "test@example.com", phone: null,
      passwordHash, displayName: "Test", avatarUrl: null, status: "ACTIVE", primaryRole: "PARENT",
      locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: new Date(), phoneVerifiedAt: null,
      lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new LoginUseCase(mocks.passwordService, mocks.authTokensService, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);
    await useCase.execute({ email: "test@example.com", password: "valid-password" });

    expect(mocks.sessionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1",
      refreshTokenHash: expect.stringContaining("hashed-fake-refresh-"),
      expiresAt: expect.any(Date),
    }));
    expect(mocks.userRoleRepo.findByUserId).toHaveBeenCalledWith("user-1");
  });
});