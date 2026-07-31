import type { UseCase, Clock } from "../index.js";
import type {
  RefreshTokenInput,
  RefreshTokenResult,
  AuthTokensService,
  SessionRepository,
  UserRepository,
} from "../index.js";
import { InvalidTokenError, SessionExpiredError, UserNotFoundError } from "./errors.js";

export class RefreshTokenUseCase
  implements UseCase<RefreshTokenInput, RefreshTokenResult>
{
  constructor(
    private readonly authTokensService: AuthTokensService,
    private readonly sessionRepo: SessionRepository,
    private readonly userRepo: UserRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenResult> {
    const { refreshToken } = input;

    // Hash the refresh token to find the session
    const refreshTokenHash =
      await this.authTokensService.hashRefreshToken(refreshToken);

    // Find session by refresh token hash
    const session = await this.sessionRepo.findByRefreshTokenHash(
      refreshTokenHash,
    );
    if (!session) {
      throw new InvalidTokenError();
    }

    // Check if session is revoked
    if (session.revokedAt) {
      throw new InvalidTokenError();
    }

    // Check if session has expired
    if (this.clock.now() > session.expiresAt) {
      await this.sessionRepo.revoke(session.id);
      throw new SessionExpiredError();
    }

    // Revoke old session (rotation)
    await this.sessionRepo.revoke(session.id);

    // Look up user to get current role for the new token
    const userRecord = await this.userRepo.findById(session.userId);
    if (!userRecord) {
      throw new UserNotFoundError();
    }

    // Generate new token pair with the user's current role
    const tokenPair = await this.authTokensService.generateTokenPair({
      sub: session.userId,
      role: userRecord.primaryRole,
    });

    // Create new session
    const newRefreshTokenHash =
      await this.authTokensService.hashRefreshToken(tokenPair.refreshToken);
    const expiresAt = new Date(
      this.clock.now().getTime() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 days

    await this.sessionRepo.create({
      userId: session.userId,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
    });

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresInSeconds: 900,
    };
  }
}