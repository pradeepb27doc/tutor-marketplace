import type {
  ParentProfileResponse,
  StudentResponse,
  BookingResponse,
  PaymentResponse,
  ListResponse,
} from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

class DashboardApiError extends Error {
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
    this.name = "DashboardApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class DashboardApiClient {
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

      throw new DashboardApiError(
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

  async getProfile(
    accessToken: string,
  ): Promise<{ data: ParentProfileResponse }> {
    return this.request<{ data: ParentProfileResponse }>("/parents/me", {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async listStudents(
    accessToken: string,
    limit = 20,
  ): Promise<{ data: StudentResponse[] }> {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));

    const qs = params.toString();
    const path = `/parents/me/students${qs ? `?${qs}` : ""}`;

    return this.request<{ data: StudentResponse[] }>(path, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async listBookings(
    accessToken: string,
    query: {
      status?: string;
      from?: string;
      to?: string;
      limit?: number;
      cursor?: string;
    } = {},
  ): Promise<ListResponse<BookingResponse>> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.cursor) params.set("cursor", query.cursor);

    const qs = params.toString();
    const path = `/bookings${qs ? `?${qs}` : ""}`;

    return this.request<ListResponse<BookingResponse>>(path, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async listPayments(
    accessToken: string,
    query: {
      status?: string;
      provider?: string;
      from?: string;
      to?: string;
      limit?: number;
      cursor?: string;
    } = {},
  ): Promise<ListResponse<PaymentResponse>> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.provider) params.set("provider", query.provider);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.cursor) params.set("cursor", query.cursor);

    const qs = params.toString();
    const path = `/payments${qs ? `?${qs}` : ""}`;

    return this.request<ListResponse<PaymentResponse>>(path, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }
}

export const dashboardApiClient = new DashboardApiClient();
export { DashboardApiError };
export type { DashboardApiClient };