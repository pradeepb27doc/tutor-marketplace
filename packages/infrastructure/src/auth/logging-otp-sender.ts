import type { OtpSender } from "@tutor-marketplace/application";

export class LoggingOtpSender implements OtpSender {
  async sendOtp(
    channel: "PHONE" | "EMAIL",
    destination: string,
    code: string,
  ): Promise<void> {
    // In MVP, log OTP to console. In production, integrate with SMS/Email provider.
    console.log(
      `[OTP] Channel: ${channel}, Destination: ${destination}, Code: ${code}`,
    );
  }
}