import type { UseCase, Clock } from "../index.js";
import type {
  OtpStartInput,
  OtpStartResult,
  OtpService,
  OtpSender,
  OtpChallengeRepository,
  UserRepository,
} from "../index.js";

export class OtpStartUseCase implements UseCase<OtpStartInput, OtpStartResult> {
  constructor(
    private readonly otpService: OtpService,
    private readonly otpSender: OtpSender,
    private readonly otpChallengeRepo: OtpChallengeRepository,
    private readonly userRepo: UserRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: OtpStartInput): Promise<OtpStartResult> {
    const { channel, destination, purpose } = input;

    // Validate destination format
    if (channel === "PHONE" && !destination.startsWith("+")) {
      throw new Error("Phone number must include country code starting with +");
    }
    if (channel === "EMAIL" && !destination.includes("@")) {
      throw new Error("Invalid email format");
    }

    // For LOGIN purpose, check if user exists
    if (purpose === "LOGIN") {
      const existingUser =
        channel === "PHONE"
          ? await this.userRepo.findByPhone(destination)
          : await this.userRepo.findByEmail(destination);

      if (!existingUser) {
        throw new Error("No account found with this contact information");
      }
    }

    // Generate OTP code
    const code = this.otpService.generateCode();
    const codeHash = await this.otpService.hashCode(code);

    // Create challenge
    const expiresAt = new Date(this.clock.now().getTime() + 10 * 60 * 1000); // 10 minutes
    const challenge = await this.otpChallengeRepo.create({
      purpose,
      phone: channel === "PHONE" ? destination : null,
      email: channel === "EMAIL" ? destination : null,
      codeHash,
      expiresAt,
    });

    // Send OTP
    await this.otpSender.sendOtp(channel, destination, code);

    return {
      challengeId: challenge.id,
      expiresInSeconds: 600,
    };
  }
}