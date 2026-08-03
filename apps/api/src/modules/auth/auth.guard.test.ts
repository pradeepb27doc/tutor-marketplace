import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "./auth.guard.js";
import type { AuthTokensService, TokenPayload } from "@tutor-marketplace/application";

const mockAuthTokensService: AuthTokensService = {
  generateTokenPair: vi.fn(),
  verifyAccessToken: vi.fn(),
  hashRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
};

const mockReflector = {
  getAllAndOverride: vi.fn(),
} as unknown as Reflector;

function mockContext(overrides: Partial<{
  headers: Record<string, string>;
  user: any;
}> = {}) {
  const request: any = {
    headers: overrides.headers ?? {},
    user: overrides.user,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe("AuthGuard", () => {
  let guard: AuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new AuthGuard(mockAuthTokensService, mockReflector);
  });

  describe("public routes", () => {
    it("should allow access when route is public", async () => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(true);
      const context = mockContext();
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it("should not require a token for public routes", async () => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(true);
      const context = mockContext({ headers: {} });
      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(mockAuthTokensService.verifyAccessToken).not.toHaveBeenCalled();
    });
  });

  describe("protected routes", () => {
    beforeEach(() => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(false);
    });

    it("should throw UnauthorizedException when no token provided", async () => {
      const context = mockContext({ headers: {} });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when authorization header is malformed", async () => {
      const context = mockContext({ headers: { authorization: "InvalidHeader" } });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when auth scheme is not Bearer", async () => {
      const context = mockContext({ headers: { authorization: "Basic abc123" } });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for invalid token", async () => {
      vi.mocked(mockAuthTokensService.verifyAccessToken).mockRejectedValue(new Error("Invalid token"));
      const context = mockContext({ headers: { authorization: "Bearer invalid-token" } });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for expired token", async () => {
      vi.mocked(mockAuthTokensService.verifyAccessToken).mockRejectedValue(new Error("jwt expired"));
      const context = mockContext({ headers: { authorization: "Bearer expired-token" } });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it("should set request.user from verified token payload", async () => {
      const payload: TokenPayload = { sub: "user-123", role: "PARENT" };
      vi.mocked(mockAuthTokensService.verifyAccessToken).mockResolvedValue(payload);
      const context = mockContext({ headers: { authorization: "Bearer valid-token" } });
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual({ id: "user-123", role: "PARENT" });
    });

    it("should pass when required roles match user role", async () => {
      const payload: TokenPayload = { sub: "user-123", role: "ADMIN" };
      vi.mocked(mockAuthTokensService.verifyAccessToken).mockResolvedValue(payload);
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValueOnce(false).mockReturnValue(["ADMIN"]);
      const context = mockContext({ headers: { authorization: "Bearer valid-token" } });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it("should throw ForbiddenException when required roles do not match", async () => {
      const payload: TokenPayload = { sub: "user-123", role: "PARENT" };
      vi.mocked(mockAuthTokensService.verifyAccessToken).mockResolvedValue(payload);
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValueOnce(false).mockReturnValue(["ADMIN"]);
      const context = mockContext({ headers: { authorization: "Bearer valid-token" } });
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });
});