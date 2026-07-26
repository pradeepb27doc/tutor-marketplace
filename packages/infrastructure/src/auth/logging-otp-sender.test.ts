import { describe, it, expect, vi } from "vitest";
import { LoggingOtpSender } from "./logging-otp-sender.js";

describe("LoggingOtpSender", () => {
  it("should log OTP to console", async () => {
    const sender = new LoggingOtpSender();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await sender.sendOtp("PHONE", "+919999999999", "123456");

    expect(consoleSpy).toHaveBeenCalledWith(
      "[OTP] Channel: PHONE, Destination: +919999999999, Code: 123456",
    );

    consoleSpy.mockRestore();
  });

  it("should log OTP via email", async () => {
    const sender = new LoggingOtpSender();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await sender.sendOtp("EMAIL", "test@example.com", "654321");

    expect(consoleSpy).toHaveBeenCalledWith(
      "[OTP] Channel: EMAIL, Destination: test@example.com, Code: 654321",
    );

    consoleSpy.mockRestore();
  });
});