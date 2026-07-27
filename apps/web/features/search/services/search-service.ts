import type { TutorSearchResponse, SearchTutorsParams } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export class SearchApiClient {
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

      throw new SearchApiError(
        apiError?.message ?? "An unexpected error occurred",
        apiError?.code ?? `HTTP_${response.status}`,
        response.status,
        apiError?.details,
      );
    }

    return (await response.json()) as T;
  }

  async searchTutors(params: SearchTutorsParams = {}): Promise<TutorSearchResponse> {
    const searchParams = new URLSearchParams();

    if (params.subjectSlug) searchParams.set("subjectSlug", params.subjectSlug);
    if (params.grade !== undefined) searchParams.set("grade", String(params.grade));
    if (params.curriculum) searchParams.set("curriculum", params.curriculum);
    if (params.city) searchParams.set("city", params.city);
    if (params.serviceMode) searchParams.set("serviceMode", params.serviceMode);
    if (params.maxFee !== undefined) searchParams.set("maxFee", String(params.maxFee));
    if (params.minRating !== undefined) searchParams.set("minRating", String(params.minRating));
    if (params.experienceMin !== undefined) searchParams.set("experienceMin", String(params.experienceMin));
    if (params.experienceMax !== undefined) searchParams.set("experienceMax", String(params.experienceMax));
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.cursor) searchParams.set("cursor", params.cursor);
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const path = `/search/tutors${qs ? `?${qs}` : ""}`;

    return this.request<TutorSearchResponse>(path);
  }
}

export class SearchApiError extends Error {
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
    this.name = "SearchApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const searchApiClient = new SearchApiClient();