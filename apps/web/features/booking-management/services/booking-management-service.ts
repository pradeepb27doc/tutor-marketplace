import type {
  BookingManagementResponse,
  StatusHistoryEntryResponse,
  ListResponse,
  BookingQueryParams,
} from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export class BookingManagementApiError extends Error {
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
    this.name = "BookingManagementApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class BookingManagementApiClient {
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

      throw new BookingManagementApiError(
        apiError?.message ?? `Request failed with status ${response.status}`,
        apiError?.code ?? `HTTP_${response.status}`,
        response.status,
        apiError?.details,
      );
    }

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

  async getBooking(
    accessToken: string,
    bookingId: string,
  ): Promise<{ data: BookingManagementResponse }> {
    return this.request<{ data: BookingManagementResponse }>(
      `/bookings/${bookingId}`,
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async getBookingHistory(
    accessToken: string,
    bookingId: string,
  ): Promise<{ data: StatusHistoryEntryResponse[] }> {
    return this.request<{ data: StatusHistoryEntryResponse[] }>(
      `/bookings/${bookingId}/status-history`,
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async listBookings(
    accessToken: string,
    query: BookingQueryParams = {},
  ): Promise<ListResponse<BookingManagementResponse>> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.cursor) params.set("cursor", query.cursor);
    if (query.offset) params.set("offset", String(query.offset));

    const qs = params.toString();
    const path = `/bookings${qs ? `?${qs}` : ""}`;

    return this.request<ListResponse<BookingManagementResponse>>(path, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async listTutorBookings(
    accessToken: string,
    query: BookingQueryParams = {},
  ): Promise<ListResponse<BookingManagementResponse>> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.cursor) params.set("cursor", query.cursor);
    if (query.offset) params.set("offset", String(query.offset));

    const qs = params.toString();
    const path = `/tutors/me/bookings${qs ? `?${qs}` : ""}`;

    return this.request<ListResponse<BookingManagementResponse>>(path, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async acceptBooking(
    accessToken: string,
    bookingId: string,
  ): Promise<{ data: BookingManagementResponse }> {
    return this.request<{ data: BookingManagementResponse }>(
      `/bookings/${bookingId}/accept`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async rejectBooking(
    accessToken: string,
    bookingId: string,
  ): Promise<{ data: BookingManagementResponse }> {
    return this.request<{ data: BookingManagementResponse }>(
      `/bookings/${bookingId}/reject`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async cancelBooking(
    accessToken: string,
    bookingId: string,
    reason?: string,
  ): Promise<{ data: BookingManagementResponse }> {
    return this.request<{ data: BookingManagementResponse }>(
      `/bookings/${bookingId}/cancel`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify({ reason }),
      },
    );
  }

  async rescheduleBooking(
    accessToken: string,
    bookingId: string,
    newAvailabilitySlotId: string,
    reason?: string,
  ): Promise<{ data: BookingManagementResponse }> {
    return this.request<{ data: BookingManagementResponse }>(
      `/bookings/${bookingId}/reschedule`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify({ newAvailabilitySlotId, reason }),
      },
    );
  }

  async completeBooking(
    accessToken: string,
    bookingId: string,
  ): Promise<{ data: BookingManagementResponse }> {
    return this.request<{ data: BookingManagementResponse }>(
      `/bookings/${bookingId}/complete`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
      },
    );
  }
}

export const bookingManagementApiClient = new BookingManagementApiClient();