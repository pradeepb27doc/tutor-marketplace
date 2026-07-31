import { describe, it, expect } from "vitest";
import { JwtAuthService } from "./jwt-auth.service.js";

describe("JwtAuthService", () => {
  const service = new JwtAuthService();

  it("should generate a token pair with access and refresh tokens", async () => {
    const result = await service.generateTokenPair({ sub: "user-1", role: "PARENT" });
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(typeof result.accessToken).toBe("string");
    expect(typeof result.refreshToken).toBe("string");
  });

  it("should verify a valid access token", async () => {
    const { accessToken } = await service.generateTokenPair({ sub: "user-1", role: "PARENT" });
    const payload = await service.verifyAccessToken(accessToken);
    expect(payload.sub).toBe("user-1");
    expect(payload.role).toBe("PARENT");
  });

  it("should throw on invalid access token", async () => {
    await expect(service.verifyAccessToken("invalid-token")).rejects.toThrow();
  });

  it("should hash refresh token deterministically", async () => {
    const hash1 = await service.hashRefreshToken("refresh-token-1");
    const hash2 = await service.hashRefreshToken("refresh-token-1");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different refresh tokens", async () => {
    const hash1 = await service.hashRefreshToken("refresh-token-1");
    const hash2 = await service.hashRefreshToken("refresh-token-2");
    expect(hash1).not.toBe(hash2);
  });

  it("should verify a valid refresh token against its hash", async () => {
    const { refreshToken } = await service.generateTokenPair({ sub: "user-1", role: "PARENT" });
    const hash = await service.hashRefreshToken(refreshToken);
    const isValid = await service.verifyRefreshToken(refreshToken, hash);
    expect(isValid).toBe(true);
  });

  it("should reject invalid refresh token against hash", async () => {
    const isValid = await service.verifyRefreshToken("wrong-token", "some-hash");
    expect(isValid).toBe(false);
  });
});