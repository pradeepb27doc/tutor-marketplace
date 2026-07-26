import { describe, it, expect } from "vitest";
import {
  AuthError,
  InvalidCredentialsError,
  OtpExpiredError,
  OtpInvalidError,
  OtpMaxAttemptsError,
  UserNotFoundError,
  UserSuspendedError,
  SessionExpiredError,
  InvalidTokenError,
  TokenExpiredError,
} from "./errors.js";

describe("AuthError", () => {
  it("should create an auth error with code, message, and status code", () => {
    const error = new AuthError("TEST_CODE", "Test message", 400);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AuthError");
    expect(error.code).toBe("TEST_CODE");
    expect(error.message).toBe("Test message");
    expect(error.statusCode).toBe(400);
  });

  it("should default to 401 status code", () => {
    const error = new AuthError("TEST_CODE", "Test message");
    expect(error.statusCode).toBe(401);
  });
});

describe("InvalidCredentialsError", () => {
  it("should create with correct code, message, and status", () => {
    const error = new InvalidCredentialsError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("INVALID_CREDENTIALS");
    expect(error.message).toBe("Invalid email or password");
    expect(error.statusCode).toBe(401);
  });
});

describe("OtpExpiredError", () => {
  it("should create with correct code, message, and status", () => {
    const error = new OtpExpiredError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("OTP_EXPIRED");
    expect(error.message).toBe("OTP has expired. Please request a new one.");
    expect(error.statusCode).toBe(401);
  });
});

describe("OtpInvalidError", () => {
  it("should create with correct code, message, and status", () => {
    const error = new OtpInvalidError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("OTP_INVALID");
    expect(error.message).toBe("Invalid OTP code.");
    expect(error.statusCode).toBe(401);
  });
});

describe("OtpMaxAttemptsError", () => {
  it("should create with correct code, message, and status", () => {
    const error = new OtpMaxAttemptsError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("OTP_MAX_ATTEMPTS");
    expect(error.message).toBe("Maximum OTP attempts exceeded. Please request a new OTP.");
    expect(error.statusCode).toBe(429);
  });
});

describe("UserNotFoundError", () => {
  it("should create with correct code, message, and status", () => {
    const error = new UserNotFoundError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("USER_NOT_FOUND");
    expect(error.message).toBe("User not found.");
    expect(error.statusCode).toBe(404);
  });
});

describe("UserSuspendedError", () => {
  it("should create with correct code, message, and status", () => {
    const error = new UserSuspendedError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("USER_SUSPENDED");
    expect(error.message).toBe("Account is suspended. Please contact support.");
    expect(error.statusCode).toBe(403);
  });
});

describe("SessionExpiredError", () => {
  it("should create with correct code, message, and status", () => {
    const error = new SessionExpiredError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("SESSION_EXPIRED");
    expect(error.message).toBe("Session has expired. Please log in again.");
    expect(error.statusCode).toBe(401);
  });
});

describe("InvalidTokenError", () => {
  it("should create with correct code, message, and status", () => {
    const error = new InvalidTokenError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("INVALID_TOKEN");
    expect(error.message).toBe("Invalid or malformed token.");
    expect(error.statusCode).toBe(401);
  });
});

describe("TokenExpiredError", () => {
  it("should create with correct code, message, and status", () => {
    const error = new TokenExpiredError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("TOKEN_EXPIRED");
    expect(error.message).toBe("Access token has expired.");
    expect(error.statusCode).toBe(401);
  });
});