import type { ReviewDto, ReviewQueryParams, ReviewsListResponse, TutorRatingSummaryResponse, CreateReviewInput } from "../types";
import { API_BASE_URL } from "../constants";

export class ReviewsApiError extends Error {
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
    this.name = "ReviewsApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ReviewsApiClient {
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

      throw new ReviewsApiError(
        apiError?.message ?? `Request failed with status ${response.status}`,
        apiError?.code ?? `HTTP_${response.status}`,
        response.status,
        apiError?.details,
      );
    }

    return (await response.json()) as T;
  }

  async listTutorReviews(
    tutorId: string,
    query?: ReviewQueryParams,
    signal?: AbortSignal,
  ): Promise<ReviewsListResponse> {
    const params = new URLSearchParams();
    if (query?.status) params.set("status", query.status);
    if (query?.rating) params.set("rating", String(query.rating));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.cursor) params.set("cursor", query.cursor);
    if (query?.offset) params.set("offset", String(query.offset));

    const qs = params.toString();
    const path = `/tutors/${encodeURIComponent(tutorId)}/reviews${qs ? `?${qs}` : ""}`;

    return this.request<ReviewsListResponse>(path, { method: "GET" }, signal);
  }

  async getTutorRatingSummary(
    tutorId: string,
    signal?: AbortSignal,
  ): Promise<TutorRatingSummaryResponse> {
    return this.request<TutorRatingSummaryResponse>(
      `/tutors/${encodeURIComponent(tutorId)}/ratings`,
      { method: "GET" },
      signal,
    );
  }

  async createReview(
    bookingId: string,
    data: CreateReviewInput,
    signal?: AbortSignal,
  ): Promise<{ data: ReviewDto }> {
    return this.request<{ data: ReviewDto }>(
      `/bookings/${encodeURIComponent(bookingId)}/reviews`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      signal,
    );
  }
}

export const reviewsApiClient = new ReviewsApiClient();