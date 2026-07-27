import type { UserDto, AuthResponse } from "../types";
import { authApiClient, AuthApiError } from "./client";

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

export class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: UserDto | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return;
    try {
      this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      this.user = userStr ? (JSON.parse(userStr) as UserDto) : null;
    } catch {
      this.clearStorage();
    }
  }

  private persistToStorage(): void {
    if (typeof window === "undefined") return;
    if (this.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, this.accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    if (this.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, this.refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    if (this.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  private clearStorage(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getUser(): UserDto | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null && this.user !== null;
  }

  private setSession(response: AuthResponse): void {
    this.accessToken = response.accessToken;
    this.refreshToken = response.refreshToken;
    this.user = response.user;
    this.persistToStorage();
    this.notify();
  }

  async login(email: string, password: string): Promise<UserDto> {
    const { data } = await authApiClient.login(email, password);
    this.setSession(data);
    return data.user;
  }

  async startOtp(
    channel: "PHONE" | "EMAIL",
    destination: string,
    purpose: "LOGIN" | "SIGNUP" | "PHONE_VERIFICATION" | "EMAIL_VERIFICATION" | "PASSWORD_RESET",
  ) {
    const body =
      channel === "PHONE"
        ? { channel, phone: destination, purpose }
        : { channel, email: destination, purpose };
    const { data } = await authApiClient.startOtp(body);
    return data;
  }

  async verifyOtp(challengeId: string, code: string, channel: "PHONE" | "EMAIL"): Promise<UserDto> {
    const { data } = await authApiClient.verifyOtp({ challengeId, code, channel });
    this.setSession(data);
    return data.user;
  }

  async refreshSession(): Promise<boolean> {
    const token = this.refreshToken;
    if (!token) return false;
    try {
      const { data } = await authApiClient.refreshToken(token);
      this.setSession(data);
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  async logout(): Promise<void> {
    const token = this.accessToken;
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.clearStorage();
    this.notify();
    // Fire-and-forget server-side logout
    if (token) {
      authApiClient.logout(token).catch(() => {
        // ignore server-side logout errors
      });
    }
  }

  async getMe(): Promise<UserDto | null> {
    const token = this.accessToken;
    if (!token) return null;
    try {
      const { data } = await authApiClient.getMe(token);
      this.user = data;
      this.persistToStorage();
      this.notify();
      return data;
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        // Token expired, try refresh
        const refreshed = await this.refreshSession();
        if (refreshed) {
          return this.getMe();
        }
      }
      return null;
    }
  }
}

export const authService = new AuthService();