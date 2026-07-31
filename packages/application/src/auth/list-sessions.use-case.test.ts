import { describe, it, expect, vi } from "vitest";
import { ListSessionsUseCase } from "./list-sessions.use-case.js";
import type { SessionRepository, SessionRecord } from "../index.js";

describe("ListSessionsUseCase", () => {
  it("should return active (non-revoked) sessions for the user", async () => {
    const sessions: SessionRecord[] = [
      { id: "session-1", userId: "user-1", refreshTokenHash: "hash1", deviceId: "device-1", ipAddress: "192.168.1.1", userAgent: "Chrome", expiresAt: new Date("2026-08-14"), revokedAt: null, createdAt: new Date("2026-07-14") },
      { id: "session-2", userId: "user-1", refreshTokenHash: "hash2", deviceId: "device-2", ipAddress: "192.168.1.2", userAgent: "Firefox", expiresAt: new Date("2026-08-14"), revokedAt: new Date("2026-07-15"), createdAt: new Date("2026-07-14") },
      { id: "session-3", userId: "user-1", refreshTokenHash: "hash3", deviceId: null, ipAddress: null, userAgent: null, expiresAt: new Date("2026-08-14"), revokedAt: null, createdAt: new Date("2026-07-13") },
    ];

    const sessionRepo: SessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByRefreshTokenHash: vi.fn(),
      listByUserId: vi.fn().mockResolvedValue(sessions),
      revoke: vi.fn(),
      revokeAllByUserId: vi.fn(),
    };

    const useCase = new ListSessionsUseCase(sessionRepo);
    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("session-1");
    expect(result[1].id).toBe("session-3");
    expect(result[0].deviceId).toBe("device-1");
    expect(result[0].ipAddress).toBe("192.168.1.1");
    expect(result[0].userAgent).toBe("Chrome");
    expect(result[1].deviceId).toBeNull();
    expect(result[1].ipAddress).toBeNull();
  });

  it("should return empty array if no active sessions", async () => {
    const sessionRepo: SessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByRefreshTokenHash: vi.fn(),
      listByUserId: vi.fn().mockResolvedValue([]),
      revoke: vi.fn(),
      revokeAllByUserId: vi.fn(),
    };

    const useCase = new ListSessionsUseCase(sessionRepo);
    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toEqual([]);
  });
});