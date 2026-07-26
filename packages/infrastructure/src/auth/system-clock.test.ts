import { describe, it, expect } from "vitest";
import { SystemClock } from "./system-clock.js";

describe("SystemClock", () => {
  it("should return the current time", () => {
    const clock = new SystemClock();
    const before = Date.now();
    const now = clock.now().getTime();
    const after = Date.now();
    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(after);
  });

  it("should return a Date object", () => {
    const clock = new SystemClock();
    expect(clock.now()).toBeInstanceOf(Date);
  });
});