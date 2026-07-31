import { describe, it, expect } from "vitest";
import { BcryptPasswordService } from "./bcrypt-password.service.js";

describe("BcryptPasswordService", () => {
  const service = new BcryptPasswordService();

  it("should hash a password", async () => {
    const hash = await service.hash("my-password");
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe("string");
  });

  it("should produce different hashes for same password (different salts)", async () => {
    const hash1 = await service.hash("same-password");
    const hash2 = await service.hash("same-password");
    expect(hash1).not.toBe(hash2);
  });

  it("should compare valid password against its hash", async () => {
    const hash = await service.hash("my-password");
    const isValid = await service.compare("my-password", hash);
    expect(isValid).toBe(true);
  });

  it("should reject invalid password against hash", async () => {
    const hash = await service.hash("my-password");
    const isValid = await service.compare("wrong-password", hash);
    expect(isValid).toBe(false);
  });
});