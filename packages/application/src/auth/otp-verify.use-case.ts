import type { UseCase, Clock } from "../index.js";
import type {
  OtpVerifyInput,
  OtpVerifyResult,
  UserDto,
  OtpService,
  AuthTokensService,
  OtpChallengeRepository,
  UserRepository,
  UserRoleRepository,
  SessionRepository,
} from "../index.js";
import {
  OtpExpiredError,
  OtpInvalidError,
  OtpMaxAttemptsError,
  UserSuspendedError,
} from "./errors.js";

const MAX_OTP_ATTEMPTS = 5;

export class OtpVerifyUseCase implements UseCase<OtpVerifyInput, OtpVerifyResult> {
  constructor(
    private readonly otpService: OtpService,
    private readonly authTokensService: AuthTokensService,
    private readonly otpChallengeRepo: OtpChallengeRepository,
    private readonly userRepo: UserRepository,
    private readonly userRoleRepo: UserRoleRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: OtpVerifyInput): Promise<OtpVerifyResult> {
    const { challengeId, code, channel } = input;

    // Find challenge
    const challenge = await this.otpChallengeRepo.findById(challengeId);
    if (!challenge) {
      throw new OtpInvalidError();
    }

    // Check if already consumed
    if (challenge.consumedAt) {
      throw new OtpInvalidError();
    }

    // Check expiry
    if (this.clock.now() > challenge.expiresAt) {
      throw new OtpExpiredError();
    }

    // Check max attempts
    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
      throw new OtpMaxAttemptsError();
    }

    // Verify code
    const isValid = await this.otpService.verifyCode(code, challenge.codeHash);
    if (!isValid) {
      await this.otpChallengeRepo.incrementAttempts(challengeId);
      throw new OtpInvalidError();
    }

    // Mark challenge as consumed
    await this.otpChallengeRepo.markConsumed(challengeId);

    // Find or create user
    const destination =
      channel === "PHONE" ? challenge.phone : challenge.email;
    let userRecord =
      channel === "PHONE" && destination
        ? await this.userRepo.findByPhone(destination)
        : destination
          ? await this.userRepo.findByEmail(destination)
          : null;

    if (!userRecord) {
      // Create new user for signup
      const newUserData: Record<string, unknown> = { primaryRole: "PARENT" };
      if (channel === "PHONE" && destination) {
        newUserData.phone = destination;
        newUserData.phoneVerifiedAt = new Date(this.clock.now());
      }
      if (channel === "EMAIL" && destination) {
        newUserData.email = destination;
        newUserData.emailVerifiedAt = new Date(this.clock.now());
      }

      userRecord = await this.userRepo.create(
        newUserData as any,
      );

      // Assign default role
      await this.userRoleRepo.assignRole(userRecord.id, "PARENT");
    } else {
      // Update last login
      userRecord = await this.userRepo.update(userRecord.id, {
        lastLoginAt: new Date(this.clock.now()),
      } as any);
    }

    // Check user status
    if (userRecord.status === "SUSPENDED") {
      throw new UserSuspendedError();
    }

    // Get user roles
    const roles = await this.userRoleRepo.findByUserId(userRecord.id);

    // Generate tokens
    const tokenPair = await this.authTokensService.generateTokenPair({
      sub: userRecord.id,
      role: userRecord.primaryRole,
    });

    // Create session
    const refreshTokenHash = await this.authTokensService.hashRefreshToken(
      tokenPair.refreshToken,
    );
    const expiresAt = new Date(
      this.clock.now().getTime() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 days

    await this.sessionRepo.create({
      userId: userRecord.id,
      refreshTokenHash,
      expiresAt,
    });

    // Build response
    const userDto: UserDto = {
      id: userRecord.id,
      displayName: userRecord.displayName,
      primaryRole: userRecord.primaryRole,
      roles: roles.map((r) => r.role),
      status: userRecord.status,
      email: userRecord.email,
      phone: userRecord.phone,
    };

    return {
      user: userDto,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresInSeconds: 900,
    };
  }
}