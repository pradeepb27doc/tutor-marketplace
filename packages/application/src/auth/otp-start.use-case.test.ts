import { describe, it, expect, vi } from "vitest";
import { OtpStartUseCase } from "./otp-start.use-case.js";
import { FakeOtpService, FakeOtpSender, FakeClock } from "@tutor-marketplace/testing";
import type { OtpChallengeRepository, UserRepository, Clock } from "../index.js";

describe("OtpStartUseCase", () => {
  const createMocks = () => {
    const otpService = new FakeOtpService();
    const otpSender = new FakeOtpSender();
    const clock = new FakeClock(new Date("2026-07-14T00:00:00.000Z"));
    const otpChallengeRepo: OtpChallengeRepository = {
      create: vi.fn().mockResolvedValue({ id: "otp-1", purpose: "LOGIN", phone: "+919999999999", email: null, codeHash: "hash", attempts: 0, expiresAt: new Date("2026-07-14T00:10:00.000Z"), consumedAt: null, createdAt: new Date(), userId: null }),
      findById: vi.fn(),
      markConsumed: vi.fn(),
      incrementAttempts: vi.fn(),
    };
    const userRepo: UserRepository = {
      findByEmail: vi.fn(),
      findByPhone: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    return { otpService, otpSender, clock, otpChallengeRepo, userRepo };
  };

  it("should send OTP via phone for LOGIN purpose and return challengeId", async () => {
    const { otpService, otpSender, clock, otpChallengeRepo, userRepo } = createMocks();
    vi.mocked(userRepo.findByPhone).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: null, phone: "+919999999999", passwordHash: null, displayName: "Test", avatarUrl: null, status: "ACTIVE", primaryRole: "PARENT", locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: null, phoneVerifiedAt: new Date(), lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new OtpStartUseCase(otpService, otpSender, otpChallengeRepo, userRepo, clock as Clock);
    const result = await useCase.execute({ channel: "PHONE", destination: "+919999999999", purpose: "LOGIN" });

    expect(result.challengeId).toBe("otp-1");
    expect(result.expiresInSeconds).toBe(600);
    expect(otpSender.sentOtps).toHaveLength(1);
    expect(otpSender.sentOtps[0]).toEqual({ channel: "PHONE", destination: "+919999999999", code: "123456" });
    expect(userRepo.findByPhone).toHaveBeenCalledWith("+919999999999");
  });

  it("should send OTP via email for LOGIN purpose", async () => {
    const { otpService, otpSender, clock, otpChallengeRepo, userRepo } = createMocks();
    vi.mocked(userRepo.findByEmail).mockResolvedValue({
      id: "user-1", publicId: "pub-user-1", email: "test@example.com", phone: null, passwordHash: null, displayName: "Test", avatarUrl: null, status: "ACTIVE", primaryRole: "PARENT", locale: "en-IN", timezone: "Asia/Kolkata", emailVerifiedAt: new Date(), phoneVerifiedAt: null, lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const useCase = new OtpStartUseCase(otpService, otpSender, otpChallengeRepo, userRepo, clock as Clock);
    const result = await useCase.execute({ channel: "EMAIL", destination: "test@example.com", purpose: "LOGIN" });

    expect(result.challengeId).toBe("otp-1");
    expect(otpSender.sentOtps).toHaveLength(1);
    expect(otpSender.sentOtps[0].channel).toBe("EMAIL");
    expect(userRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("should throw if phone number does not start with +", async () => {
    const { otpService, otpSender, clock, otpChallengeRepo, userRepo } = createMocks();
    const useCase = new OtpStartUseCase(otpService, otpSender, otpChallengeRepo, userRepo, clock as Clock);

    await expect(useCase.execute({ channel: "PHONE", destination: "919999999999", purpose: "LOGIN" })).rejects.toThrow("Phone number must include country code starting with +");
  });

  it("should throw if email format is invalid", async () => {
    const { otpService, otpSender, clock, otpChallengeRepo, userRepo } = createMocks();
    const useCase = new OtpStartUseCase(otpService, otpSender, otpChallengeRepo, userRepo, clock as Clock);

    await expect(useCase.execute({ channel: "EMAIL", destination: "invalid", purpose: "LOGIN" })).rejects.toThrow("Invalid email format");
  });

  it("should throw if no account found for LOGIN purpose", async () => {
    const { otpService, otpSender, clock, otpChallengeRepo, userRepo } = createMocks();
    vi.mocked(userRepo.findByPhone).mockResolvedValue(null);

    const useCase = new OtpStartUseCase(otpService, otpSender, otpChallengeRepo, userRepo, clock as Clock);
    await expect(useCase.execute({ channel: "PHONE", destination: "+919999999999", purpose: "LOGIN" })).rejects.toThrow("No account found with this contact information");
  });

  it("should not check existing user for SIGNUP purpose", async () => {
    const { otpService, otpSender, clock, otpChallengeRepo, userRepo } = createMocks();
    const useCase = new OtpStartUseCase(otpService, otpSender, otpChallengeRepo, userRepo, clock as Clock);
    const result = await useCase.execute({ channel: "PHONE", destination: "+919999999999", purpose: "SIGNUP" });

    expect(result.challengeId).toBe("otp-1");
    expect(userRepo.findByPhone).not.toHaveBeenCalled();
    expect(otpSender.sentOtps).toHaveLength(1);
  });

  it("should create challenge with 10 minute expiry", async () => {
    const { otpService, otpSender, clock, otpChallengeRepo, userRepo } = createMocks();
    const useCase = new OtpStartUseCase(otpService, otpSender, otpChallengeRepo, userRepo, clock as Clock);
    await useCase.execute({ channel: "PHONE", destination: "+919999999999", purpose: "SIGNUP" });

    expect(otpChallengeRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      purpose: "SIGNUP",
      codeHash: "fake-otp-hash-123456",
      expiresAt: new Date("2026-07-14T00:10:00.000Z"),
    }));
  });
});