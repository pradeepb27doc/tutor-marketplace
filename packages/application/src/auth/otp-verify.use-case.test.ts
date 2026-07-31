import { describe, it, expect, vi } from "vitest";
import { OtpVerifyUseCase } from "./otp-verify.use-case.js";
import { FakeOtpService, FakeAuthTokensService, FakeClock } from "@tutor-marketplace/testing";
import type { OtpChallengeRepository, UserRepository, UserRoleRepository, SessionRepository, Clock, OtpService, AuthTokensService } from "../index.js";

describe("OtpVerifyUseCase", () => {
  const defaultChallenge = {
    id: "otp-1", userId: null, purpose: "LOGIN", phone: "+919999999999", email: null,
    codeHash: "fake-otp-hash-123456", attempts: 0, expiresAt: new Date("2026-07-14T00:10:00.000Z"),
    consumedAt: null, createdAt: new Date(),
  };

  const createMocks = () => {
    const otpService: OtpService = new FakeOtpService();
    const authTokensService: AuthTokensService = new FakeAuthTokensService();
    const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
    const otpChallengeRepo: OtpChallengeRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(defaultChallenge),
      markConsumed: vi.fn(),
      incrementAttempts: vi.fn(),
    };
    const userRepo: UserRepository = {
      findByEmail: vi.fn(),
      findByPhone: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockImplementation(async (id, data) => {
        const lastFindResult =
          (userRepo.findByPhone as any).mock.results?.[0]?.value ||
          (userRepo.findByEmail as any).mock.results?.[0]?.value;
        const baseUser = await lastFindResult;
        return {
          id,
          status: "ACTIVE",
          primaryRole: "PARENT",
          ...baseUser,
          ...data,
        };
      }),
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

    return { otpService, authTokensService, clock, otpChallengeRepo, userRepo, userRoleRepo, sessionRepo };
  };

  it("should verify OTP and return tokens for existing user", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.userRepo.findByPhone).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: "test@example.com", phone: "+919999999999",
      passwordHash: null, displayName: "Test", avatarUrl: null, status: "ACTIVE", primaryRole: "PARENT",
      locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: null, phoneVerifiedAt: new Date(),
      lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new OtpVerifyUseCase(mocks.otpService, mocks.authTokensService, mocks.otpChallengeRepo, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);
    const result = await useCase.execute({ challengeId: "otp-1", code: "123456", channel: "PHONE" });

    expect(result.accessToken).toContain("fake-access-");
    expect(result.refreshToken).toContain("fake-refresh-");
    expect(result.expiresInSeconds).toBe(900);
    expect(result.user.id).toBe("user-1");
    expect(mocks.otpChallengeRepo.markConsumed).toHaveBeenCalledWith("otp-1");
    expect(mocks.userRepo.update).toHaveBeenCalledWith("user-1", expect.objectContaining({ lastLoginAt: expect.any(Date) }));
    expect(mocks.sessionRepo.create).toHaveBeenCalled();
  });

  it("should create new user if not found for SIGNUP flow", async () => {
    const mocks = createMocks();
    const newChallenge = { ...defaultChallenge, purpose: "SIGNUP", phone: "+919999999999" };
    vi.mocked(mocks.otpChallengeRepo.findById).mockResolvedValue(newChallenge);
    vi.mocked(mocks.userRepo.findByPhone).mockResolvedValue(null);
    vi.mocked(mocks.userRepo.create).mockResolvedValue({
      id: "new-user-1", publicId: "pub-new-user-1", email: null, phone: "+919999999999",
      passwordHash: null, displayName: null, avatarUrl: null, status: "ACTIVE", primaryRole: "PARENT",
      locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: null, phoneVerifiedAt: new Date(),
      lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new OtpVerifyUseCase(mocks.otpService, mocks.authTokensService, mocks.otpChallengeRepo, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);
    const result = await useCase.execute({ challengeId: "otp-1", code: "123456", channel: "PHONE" });

    expect(result.user.id).toBe("new-user-1");
    expect(mocks.userRepo.create).toHaveBeenCalled();
    expect(mocks.userRoleRepo.assignRole).toHaveBeenCalledWith("new-user-1", "PARENT");
  });

  it("should throw OtpInvalidError if challenge not found", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.otpChallengeRepo.findById).mockResolvedValue(null);
    const useCase = new OtpVerifyUseCase(mocks.otpService, mocks.authTokensService, mocks.otpChallengeRepo, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);

    await expect(useCase.execute({ challengeId: "invalid", code: "123456", channel: "PHONE" })).rejects.toThrow("Invalid OTP code.");
  });

  it("should throw OtpInvalidError if challenge already consumed", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.otpChallengeRepo.findById).mockResolvedValue({ ...defaultChallenge, consumedAt: new Date() });
    const useCase = new OtpVerifyUseCase(mocks.otpService, mocks.authTokensService, mocks.otpChallengeRepo, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);

    await expect(useCase.execute({ challengeId: "otp-1", code: "123456", channel: "PHONE" })).rejects.toThrow("Invalid OTP code.");
  });

  it("should throw OtpExpiredError if challenge expired", async () => {
    const mocks = createMocks();
    mocks.clock.set(new Date("2026-07-14T00:11:00.000Z"));
    const useCase = new OtpVerifyUseCase(mocks.otpService, mocks.authTokensService, mocks.otpChallengeRepo, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);

    await expect(useCase.execute({ challengeId: "otp-1", code: "123456", channel: "PHONE" })).rejects.toThrow("OTP has expired");
  });

  it("should throw OtpMaxAttemptsError if max attempts exceeded", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.otpChallengeRepo.findById).mockResolvedValue({ ...defaultChallenge, attempts: 5 });
    const useCase = new OtpVerifyUseCase(mocks.otpService, mocks.authTokensService, mocks.otpChallengeRepo, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);

    await expect(useCase.execute({ challengeId: "otp-1", code: "123456", channel: "PHONE" })).rejects.toThrow("Maximum OTP attempts exceeded");
  });

  it("should throw OtpInvalidError if code is wrong and increment attempts", async () => {
    const mocks = createMocks();
    const useCase = new OtpVerifyUseCase(mocks.otpService, mocks.authTokensService, mocks.otpChallengeRepo, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);

    await expect(useCase.execute({ challengeId: "otp-1", code: "wrong-code", channel: "PHONE" })).rejects.toThrow("Invalid OTP code.");
    expect(mocks.otpChallengeRepo.incrementAttempts).toHaveBeenCalledWith("otp-1");
  });

  it("should throw UserSuspendedError if user is suspended", async () => {
    const mocks = createMocks();
    vi.mocked(mocks.userRepo.findByPhone).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: null, phone: "+919999999999",
      passwordHash: null, displayName: "Test", avatarUrl: null, status: "SUSPENDED", primaryRole: "PARENT",
      locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: null, phoneVerifiedAt: new Date(),
      lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new OtpVerifyUseCase(mocks.otpService, mocks.authTokensService, mocks.otpChallengeRepo, mocks.userRepo, mocks.userRoleRepo, mocks.sessionRepo, mocks.clock as Clock);
    await expect(useCase.execute({ challengeId: "otp-1", code: "123456", channel: "PHONE" })).rejects.toThrow("Account is suspended");
  });
});