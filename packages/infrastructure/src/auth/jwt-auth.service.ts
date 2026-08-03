import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { AuthTokensService, TokenPayload, TokenPair } from "@tutor-marketplace/application";
import { getEnv } from "@tutor-marketplace/config";

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): Buffer {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64");
}

function hmacSha256(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export class JwtAuthService implements AuthTokensService {
  private readonly secret: string;
  private readonly accessTokenExpirySeconds: number;

  constructor() {
    const env = getEnv();
    this.secret = env.JWT_SECRET;
    this.accessTokenExpirySeconds = env.JWT_ACCESS_TOKEN_EXPIRY_SECONDS;
  }

  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken();
    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("INVALID_TOKEN");
    }

    const [headerB64, payloadB64, signature] = parts;
    const expectedSig = hmacSha256(this.secret, `${headerB64}.${payloadB64}`);

    // Constant-time signature comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      throw new Error("INVALID_TOKEN");
    }

    // Validate the algorithm header to prevent algorithm confusion attacks
    let header: { alg?: string };
    try {
      header = JSON.parse(base64UrlDecode(headerB64).toString("utf-8")) as { alg?: string };
    } catch {
      throw new Error("INVALID_TOKEN");
    }
    if (header.alg !== "HS256") {
      throw new Error("INVALID_TOKEN");
    }

    const payloadStr = base64UrlDecode(payloadB64).toString("utf-8");
    let payload: TokenPayload;
    try {
      payload = JSON.parse(payloadStr) as TokenPayload;
    } catch {
      throw new Error("INVALID_TOKEN");
    }

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error("TOKEN_EXPIRED");
    }

    return payload;
  }

  async hashRefreshToken(token: string): Promise<string> {
    return createHash("sha256").update(token).digest("hex");
  }

  async verifyRefreshToken(token: string, hash: string): Promise<boolean> {
    const computedHash = await this.hashRefreshToken(token);
    return computedHash === hash;
  }

  private createAccessToken(payload: TokenPayload): string {
    const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload: TokenPayload = {
      sub: payload.sub,
      role: payload.role,
      iat: now,
      exp: now + this.accessTokenExpirySeconds,
    };

    const payloadStr = base64UrlEncode(Buffer.from(JSON.stringify(tokenPayload)));
    const signature = hmacSha256(this.secret, `${header}.${payloadStr}`);

    return `${header}.${payloadStr}.${signature}`;
  }

  private createRefreshToken(): string {
    return randomBytes(48).toString("hex");
  }
}