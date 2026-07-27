const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export class AuthApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? API_BASE_URL;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody: Record<string, unknown> | null = null;
      try {
        errorBody = (await response.json()) as Record<string, unknown>;
      } catch {
        // ignore parse errors
      }

      const apiError = errorBody?.error as
        | { code?: string; message?: string; details?: Record<string, unknown> }
        | undefined;

      throw new AuthApiError(
        apiError?.message ?? "An unexpected error occurred",
        apiError?.code ?? `HTTP_${response.status}`,
        response.status,
        apiError?.details,
      );
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return (await response.json()) as T;
  }

  async login(email: string, password: string) {
    return this.request<{ data: import("../types").AuthResponse }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
  }

  async startOtp(body: import("../types").OtpStartRequest) {
    return this.request<{ data: import("../types").OtpStartResponse }>(
      "/auth/otp/start",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
  }

  async verifyOtp(body: import("../types").OtpVerifyRequest) {
    return this.request<{ data: import("../types").AuthResponse }>(
      "/auth/otp/verify",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ data: import("../types").AuthResponse }>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      },
    );
  }

  async logout(accessToken: string, sessionId?: string) {
    return this.request<void>("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
    });
  }

  async logoutAll(accessToken: string) {
    return this.request<void>("/auth/logout-all", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async getMe(accessToken: string) {
    return this.request<{ data: import("../types").UserDto }>("/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}

export class AuthApiError extends Error {
  public code: string;
  public status: number;
  public details: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const authApiClient = new AuthApiClient();