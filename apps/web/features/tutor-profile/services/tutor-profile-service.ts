import type { TutorProfileApiResponse } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export class TutorProfileApiError extends Error {
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
    this.name = "TutorProfileApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class TutorProfileApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? API_BASE_URL;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    signal?: AbortSignal,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal,
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

      throw new TutorProfileApiError(
        apiError?.message ?? `Request failed with status ${response.status}`,
        apiError?.code ?? `HTTP_${response.status}`,
        response.status,
        apiError?.details,
      );
    }

    return (await response.json()) as T;
  }

  async getTutorDetail(
    tutorId: string,
    signal?: AbortSignal,
  ): Promise<TutorProfileApiResponse> {
    return this.request<TutorProfileApiResponse>(
      `/search/tutors/${encodeURIComponent(tutorId)}`,
      { method: "GET" },
      signal,
    );
  }
}

export const tutorProfileApiClient = new TutorProfileApiClient();