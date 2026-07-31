export type EntityId = string;

export interface DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: EntityId;
  name: string;
  aggregateId: EntityId;
  occurredAt: Date;
  payload: TPayload;
}

// --- Value Objects ---

export type Email = string;
export type Phone = string;
export type Token = string;

export enum UserRole {
  PARENT = "PARENT",
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  ADMIN = "ADMIN",
  SUPPORT = "SUPPORT",
}

export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DEACTIVATED = "DEACTIVATED",
  DELETED = "DELETED",
}

export enum AuthProviderType {
  PASSWORD = "PASSWORD",
  OTP = "OTP",
  GOOGLE = "GOOGLE",
  APPLE = "APPLE",
}

export enum OtpPurpose {
  LOGIN = "LOGIN",
  SIGNUP = "SIGNUP",
  PHONE_VERIFICATION = "PHONE_VERIFICATION",
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
}

export enum OtpChannel {
  PHONE = "PHONE",
  EMAIL = "EMAIL",
}

// --- Auth Domain Events ---

export interface UserLoggedInEvent extends DomainEvent<{ userId: string; method: string }> {
  name: "user.logged_in";
}

export interface UserRegisteredEvent extends DomainEvent<{ userId: string; email?: string; phone?: string }> {
  name: "user.registered";
}

export interface UserLoggedOutEvent extends DomainEvent<{ userId: string; sessionId: string }> {
  name: "user.logged_out";
}