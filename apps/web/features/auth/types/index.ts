export interface UserDto {
  id: string;
  displayName: string | null;
  primaryRole: string;
  roles: string[];
  status: string;
  email: string | null;
  phone: string | null;
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: Record<string, unknown>;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpStartRequest {
  channel: "PHONE" | "EMAIL";
  destination?: string;
  phone?: string;
  email?: string;
  purpose: "LOGIN" | "SIGNUP" | "PHONE_VERIFICATION" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";
}

export interface OtpStartResponse {
  challengeId: string;
  channel: string;
  destination: string;
  expiresAt: string;
}

export interface OtpVerifyRequest {
  challengeId: string;
  code: string;
  channel: "PHONE" | "EMAIL";
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}