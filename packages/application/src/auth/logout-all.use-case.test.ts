import { describe, it, expect, vi } from "vitest";
import { LogoutAllUseCase } from "./logout-all.use-case.js";
import type { SessionRepository } from "../index.js";

describe("LogoutAllUseCase", () => {
  it("should revoke all sessions for the user", async () => {
    const sessionRepo: SessionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByRefreshTokenHash: vi.fn(),
      listByUserId: vi.fn(),
      revoke: vi.fn(),
      revokeAllByUserId: vi.fn(),
    };

    const useCase = new LogoutAllUseCase(sessionRepo);
    await useCase.execute({ userId: "user-1" });

    expect(sessionRepo.revokeAllByUserId).toHaveBeenCalledWith("user-1");
  });
});