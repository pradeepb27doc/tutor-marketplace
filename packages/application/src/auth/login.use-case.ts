import type { UseCase, Clock } from "../index.js";
import type {
  LoginInput,
  OtpVerifyResult,
  UserDto,
  PasswordService,
  AuthTokensService,
  UserRepository,
  UserRoleRepository,
  SessionRepository,
} from "../index.js";
import { InvalidCredentialsError, UserSuspendedError } from "./errors.js";

export class LoginUseCase implements UseCase<LoginInput, OtpVerifyResult> {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly authTokensService: AuthTokensService,
    private readonly userRepo: UserRepository,
    private readonly userRoleRepo: UserRoleRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: LoginInput): Promise<OtpVerifyResult> {
    const { email, password } = input;

    // Find user by email
    const userRecord = await this.userRepo.findByEmail(email);
    if (!userRecord || !userRecord.passwordHash) {
      throw new InvalidCredentialsError();
    }

    // Check user status
    if (userRecord.status === "SUSPENDED") {
      throw new UserSuspendedError();
    }

    // Verify password
    const isValid = await this.passwordService.compare(
      password,
      userRecord.passwordHash,
    );
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    // Update last login
    await this.userRepo.update(userRecord.id, {
      lastLoginAt: new Date(this.clock.now()),
    } as any);

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