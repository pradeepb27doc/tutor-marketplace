import type { AuthTokensService, PasswordService, OtpService, OtpSender, Clock, CurrentUserProvider, TokenPair, TokenPayload } from "@tutor-marketplace/application";

/**
 * Fake AuthTokensService for testing.
 * Generates deterministic tokens and does not perform real signing.
 */
export class FakeAuthTokensService implements AuthTokensService {
  private tokenCounter = 0;

  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    this.tokenCounter++;
    const tokenId = `test-token-${this.tokenCounter}`;
    return {
      accessToken: `fake-access-${tokenId}-${payload.sub}`,
      refreshToken: `fake-refresh-${tokenId}-${payload.sub}`,
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    if (!token.startsWith("fake-access-")) {
      throw new Error("Invalid token");
    }
    return { sub: "test-user-id", role: "PARENT" };
  }

  async hashRefreshToken(token: string): Promise<string> {
    return `hashed-${token}`;
  }

  async verifyRefreshToken(_token: string, hash: string): Promise<boolean> {
    return hash.startsWith("hashed-fake-refresh-");
  }
}

/**
 * Fake PasswordService for testing.
 * Uses a simple reversible "hash" for deterministic test assertions.
 */
export class FakePasswordService implements PasswordService {
  async hash(password: string): Promise<string> {
    return `fake-hash-${password}`;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return hash === `fake-hash-${password}`;
  }
}

/**
 * Fake OtpService for testing.
 */
export class FakeOtpService implements OtpService {
  generateCode(): string {
    return "123456";
  }

  async hashCode(code: string): Promise<string> {
    return `fake-otp-hash-${code}`;
  }

  async verifyCode(code: string, hash: string): Promise<boolean> {
    return hash === `fake-otp-hash-${code}`;
  }
}

/**
 * Fake OtpSender for testing.
 * Captures sent codes for assertion in tests.
 */
export class FakeOtpSender implements OtpSender {
  public sentOtps: Array<{ channel: "PHONE" | "EMAIL"; destination: string; code: string }> = [];

  async sendOtp(channel: "PHONE" | "EMAIL", destination: string, code: string): Promise<void> {
    this.sentOtps.push({ channel, destination, code });
  }

  /** Reset captured OTPs between tests. */
  reset(): void {
    this.sentOtps = [];
  }
}

/**
 * Fake Clock for testing.
 * Allows precise control over time in tests.
 */
export class FakeClock implements Clock {
  private _now: Date;

  constructor(fixedDate?: Date) {
    this._now = fixedDate ?? new Date("2026-07-14T00:00:00.000Z");
  }

  now(): Date {
    return this._now;
  }

  /** Advance the clock by milliseconds. */
  advance(ms: number): void {
    this._now = new Date(this._now.getTime() + ms);
  }

  /** Set the clock to an exact date. */
  set(date: Date): void {
    this._now = date;
  }
}

/**
 * Fake CurrentUserProvider for testing.
 * Provides a configurable user identity for use case tests.
 */
export class FakeCurrentUserProvider implements CurrentUserProvider {
  private userId = "test-user-id";
  private userRole = "PARENT";

  configure(userId: string, role: string): void {
    this.userId = userId;
    this.userRole = role;
  }

  getUserId(): string {
    return this.userId;
  }

  getUserRole(): string {
    return this.userRole;
  }
}