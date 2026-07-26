import { describe, it, expect } from "vitest";
import { OtpCodeService } from "./otp-code.service.js";

describe("OtpCodeService", () => {
  const service = new OtpCodeService();

  it("should generate a 6-digit code", () => {
    const code = service.generateCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("should generate different codes on successive calls", () => {
    const code1 = service.generateCode();
    const code2 = service.generateCode();
    expect(code1).not.toBe(code2);
  });

  it("should hash a code deterministically", async () => {
    const hash1 = await service.hashCode("123456");
    const hash2 = await service.hashCode("123456");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different codes", async () => {
    const hash1 = await service.hashCode("123456");
    const hash2 = await service.hashCode("654321");
    expect(hash1).not.toBe(hash2);
  });

  it("should verify a valid code against its hash", async () => {
    const code = "123456";
    const hash = await service.hashCode(code);
    const isValid = await service.verifyCode(code, hash);
    expect(isValid).toBe(true);
  });

  it("should reject an invalid code against hash", async () => {
    const hash = await service.hashCode("123456");
    const isValid = await service.verifyCode("wrong", hash);
    expect(isValid).toBe(false);
  });
});