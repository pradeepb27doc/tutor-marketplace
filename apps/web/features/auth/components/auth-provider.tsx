"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { UserDto } from "../types";
import { authService } from "../services/auth-service";
import { AuthApiError } from "../services/client";

interface AuthContextValue {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserDto>;
  startOtp: (
    channel: "PHONE" | "EMAIL",
    destination: string,
    purpose: "LOGIN" | "SIGNUP" | "PHONE_VERIFICATION" | "EMAIL_VERIFICATION" | "PASSWORD_RESET",
  ) => Promise<{ challengeId: string; channel: string; destination: string; expiresAt: string }>;
  verifyOtp: (challengeId: string, code: string, channel: "PHONE" | "EMAIL") => Promise<UserDto>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  authApiError: typeof AuthApiError;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialUser = authService.getUser();
    setUser(initialUser);
    setIsLoading(false);

    const unsub = authService.subscribe(() => {
      setUser(authService.getUser());
    });

    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password);
    return u;
  }, []);

  const startOtp = useCallback(
    async (
      channel: "PHONE" | "EMAIL",
      destination: string,
      purpose: "LOGIN" | "SIGNUP" | "PHONE_VERIFICATION" | "EMAIL_VERIFICATION" | "PASSWORD_RESET",
    ) => {
      return await authService.startOtp(channel, destination, purpose);
    },
    [],
  );

  const verifyOtp = useCallback(
    async (challengeId: string, code: string, channel: "PHONE" | "EMAIL") => {
      return await authService.verifyOtp(challengeId, code, channel);
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const getAccessToken = useCallback(() => {
    return authService.getAccessToken();
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: authService.isAuthenticated(),
    isLoading,
    login,
    startOtp,
    verifyOtp,
    logout,
    getAccessToken,
    authApiError: AuthApiError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}