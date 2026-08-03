import { describe, it, expect } from "vitest";
import { createWorkerHealthCheck } from "./worker-health.js";

describe("createWorkerHealthCheck", () => {
  it("should return a health payload with service 'worker' and status 'ok'", () => {
    const result = createWorkerHealthCheck();
    expect(result.service).toBe("worker");
    expect(result.status).toBe("ok");
    expect(result.checkedAt).toBeDefined();
    expect(typeof result.checkedAt).toBe("string");
    // checkedAt should be a valid ISO date
    expect(() => new Date(result.checkedAt).toISOString()).not.toThrow();
  });

  it("should generate a recent timestamp on each call", () => {
    const before = new Date();
    const result = createWorkerHealthCheck();
    const after = new Date();
    const checkedAt = new Date(result.checkedAt);
    expect(checkedAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(checkedAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });
});
