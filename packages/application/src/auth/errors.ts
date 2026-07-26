export class AuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }
}

export class OtpExpiredError extends AuthError {
  constructor() {
    super("OTP_EXPIRED", "OTP has expired. Please request a new one.", 401);
  }
}

export class OtpInvalidError extends AuthError {
  constructor() {
    super("OTP_INVALID", "Invalid OTP code.", 401);
  }
}

export class OtpMaxAttemptsError extends AuthError {
  constructor() {
    super("OTP_MAX_ATTEMPTS", "Maximum OTP attempts exceeded. Please request a new OTP.", 429);
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super("USER_NOT_FOUND", "User not found.", 404);
  }
}

export class UserSuspendedError extends AuthError {
  constructor() {
    super("USER_SUSPENDED", "Account is suspended. Please contact support.", 403);
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super("SESSION_EXPIRED", "Session has expired. Please log in again.", 401);
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super("INVALID_TOKEN", "Invalid or malformed token.", 401);
  }
}

export class TokenExpiredError extends AuthError {
  constructor() {
    super("TOKEN_EXPIRED", "Access token has expired.", 401);
  }
}