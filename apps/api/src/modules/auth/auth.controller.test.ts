import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthController } from "./auth.controller.js";
import {
  OtpStartUseCase,
  OtpVerifyUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  LogoutAllUseCase,
  GetCurrentUserUseCase,
  ListSessionsUseCase,
  RevokeSessionUseCase,
} from "@tutor-marketplace/application";

describe("AuthController", () => {
  let controller: AuthController;
  const mocks = {
    otpStart: { execute: vi.fn() },
    otpVerify: { execute: vi.fn() },
    login: { execute: vi.fn() },
    refresh: { execute: vi.fn() },
    logout: { execute: vi.fn() },
    logoutAll: { execute: vi.fn() },
    getMe: { execute: vi.fn() },
    listSessions: { execute: vi.fn() },
    revokeSession: { execute: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AuthController(
      mocks.otpStart as unknown as OtpStartUseCase,
      mocks.otpVerify as unknown as OtpVerifyUseCase,
      mocks.login as unknown as LoginUseCase,
      mocks.refresh as unknown as RefreshTokenUseCase,
      mocks.logout as unknown as LogoutUseCase,
      mocks.logoutAll as unknown as LogoutAllUseCase,
      mocks.getMe as unknown as GetCurrentUserUseCase,
      mocks.listSessions as unknown as ListSessionsUseCase,
      mocks.revokeSession as unknown as RevokeSessionUseCase,
    );
  });

  describe("login", () => {
    it("should return login result wrapped in data", async () => {
      const loginResult = {
        user: { id: "user-1", displayName: "Test", primaryRole: "PARENT", roles: ["PARENT"], status: "ACTIVE", email: "test@example.com", phone: null },
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresInSeconds: 900,
      };
      mocks.login.execute.mockResolvedValue(loginResult);

      const result = await controller.login({ email: "test@example.com", password: "password" } as any);

      expect(result).toEqual({ data: loginResult });
      expect(mocks.login.execute).toHaveBeenCalledWith({ email: "test@example.com", password: "password" });
    });

    it("should propagate invalid credentials error", async () => {
      mocks.login.execute.mockRejectedValue(new Error("Invalid email or password"));
      await expect(controller.login({ email: "bad@example.com", password: "wrong" } as any)).rejects.toThrow("Invalid email or password");
    });

    it("should propagate missing credentials error", async () => {
      mocks.login.execute.mockRejectedValue(new Error("Email and password are required"));
      await expect(controller.login({ email: "", password: "" } as any)).rejects.toThrow("Email and password are required");
    });
  });

  describe("refresh", () => {
    it("should return new token pair", async () => {
      const refreshResult = { accessToken: "new-access", refreshToken: "new-refresh", expiresInSeconds: 900 };
      mocks.refresh.execute.mockResolvedValue(refreshResult);

      const result = await controller.refresh({ refreshToken: "old-refresh" } as any);

      expect(result).toEqual({ data: refreshResult });
      expect(mocks.refresh.execute).toHaveBeenCalledWith({ refreshToken: "old-refresh" });
    });

    it("should propagate invalid refresh token error", async () => {
      mocks.refresh.execute.mockRejectedValue(new Error("Invalid refresh token"));
      await expect(controller.refresh({ refreshToken: "bad" } as any)).rejects.toThrow("Invalid refresh token");
    });
  });

  describe("logout", () => {
    it("should call logout use case with session id from header", async () => {
      const req = { user: { id: "user-1" }, headers: { "x-session-id": "session-1" } } as any;
      await controller.logout(req);
      expect(mocks.logout.execute).toHaveBeenCalledWith({ userId: "user-1", sessionId: "session-1" });
    });

    it("should not call logout use case when no session id header", async () => {
      const req = { user: { id: "user-1" }, headers: {} } as any;
      await controller.logout(req);
      expect(mocks.logout.execute).not.toHaveBeenCalled();
    });
  });

  describe("logoutAll", () => {
    it("should call logoutAll use case with user id", async () => {
      const req = { user: { id: "user-1" } } as any;
      await controller.logoutAll(req);
      expect(mocks.logoutAll.execute).toHaveBeenCalledWith({ userId: "user-1" });
    });
  });

  describe("getMe", () => {
    it("should return current user", async () => {
      const user = { id: "user-1", displayName: "Test", primaryRole: "PARENT", roles: ["PARENT"], status: "ACTIVE", email: "test@example.com", phone: null };
      mocks.getMe.execute.mockResolvedValue(user);

      const req = { user: { id: "user-1" } } as any;
      const result = await controller.getMe(req);

      expect(result).toEqual({ data: user });
      expect(mocks.getMe.execute).toHaveBeenCalledWith({ userId: "user-1" });
    });
  });

  describe("listSessions", () => {
    it("should return list of sessions", async () => {
      const sessions = [{ id: "session-1", userId: "user-1", refreshTokenHash: "hash", deviceId: null, ipAddress: null, userAgent: null, expiresAt: new Date(), revokedAt: null, createdAt: new Date() }];
      mocks.listSessions.execute.mockResolvedValue(sessions);

      const req = { user: { id: "user-1" } } as any;
      const result = await controller.listSessions(req);

      expect(result).toEqual({ data: sessions });
    });
  });

  describe("revokeSession", () => {
    it("should revoke a session", async () => {
      const req = { user: { id: "user-1" } } as any;
      await controller.revokeSession(req, "session-1");
      expect(mocks.revokeSession.execute).toHaveBeenCalledWith({ userId: "user-1", sessionId: "session-1" });
    });
  });

  describe("otp start", () => {
    it("should start OTP flow", async () => {
      mocks.otpStart.execute.mockResolvedValue({ challengeId: "challenge-1", expiresInSeconds: 300 });
      const result = await controller.startOtp({ channel: "EMAIL", destination: "test@example.com", purpose: "LOGIN" } as any);
      expect(result).toEqual({ data: { challengeId: "challenge-1", expiresInSeconds: 300 } });
      expect(mocks.otpStart.execute).toHaveBeenCalledWith({ channel: "EMAIL", destination: "test@example.com", purpose: "LOGIN" });
    });
  });

  describe("otp verify", () => {
    it("should verify OTP and return tokens", async () => {
      const verifyResult = {
        user: { id: "user-1", displayName: "Test", primaryRole: "PARENT", roles: ["PARENT"], status: "ACTIVE", email: "test@example.com", phone: null },
        accessToken: "access",
        refreshToken: "refresh",
        expiresInSeconds: 900,
      };
      mocks.otpVerify.execute.mockResolvedValue(verifyResult);
      const result = await controller.verifyOtp({ challengeId: "challenge-1", code: "123456", channel: "EMAIL" } as any);
      expect(result).toEqual({ data: verifyResult });
    });
  });
});