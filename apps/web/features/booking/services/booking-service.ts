import type {
  AvailabilityApiResponse,
  BookingApiResponse,
  CreateBookingRequest,
} from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

class BookingApiError extends Error {
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
    this.name = "BookingApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class BookingApiClient {
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

      throw new BookingApiError(
        apiError?.message ?? `Request failed with status ${response.status}`,
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

  private authHeaders(accessToken: string): Record<string, string> {
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async getPublicAvailability(
    tutorId: string,
    from: string,
    to: string,
    timezone?: string,
    signal?: AbortSignal,
  ): Promise<AvailabilityApiResponse> {
    const params = new URLSearchParams({ from, to });
    if (timezone) params.set("timezone", timezone);

    return this.request<AvailabilityApiResponse>(
      `/tutors/${encodeURIComponent(tutorId)}/availability?${params.toString()}`,
      { method: "GET", signal },
    );
  }

  async createBooking(
    dto: CreateBookingRequest,
    accessToken: string,
  ): Promise<BookingApiResponse> {
    return this.request<BookingApiResponse>("/bookings", {
      method: "POST",
      headers: this.authHeaders(accessToken),
      body: JSON.stringify(dto),
    });
  }

  async getBooking(
    bookingId: string,
    accessToken: string,
  ): Promise<BookingApiResponse> {
    return this.request<BookingApiResponse>(
      `/bookings/${encodeURIComponent(bookingId)}`,
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
  }
}

export const bookingApiClient = new BookingApiClient();
export { BookingApiError };
export type { BookingApiClient };