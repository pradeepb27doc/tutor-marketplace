import type {
  AdminOverview,
  AdminUserSummary,
  AdminTutorSummary,
  AdminBookingSummary,
  AdminPaymentSummary,
  AdminRefundSummary,
  AuditLogRecord,
  CursorPage,
  VerificationCaseDto,
  ListVerificationCasesResultDto,
  ReviewDto,
  ReviewModerationStatus,
} from "../types";
import { API_BASE_URL } from "../constants";

export class AdminApiError extends Error {
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
    this.name = "AdminApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class AdminApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? API_BASE_URL;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
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

      throw new AdminApiError(
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

  private buildQuery(params: Record<string, string | number | null | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== "") {
        search.set(key, String(value));
      }
    }
    const qs = search.toString();
    return qs ? `?${qs}` : "";
  }

  // --- Overview ---

  async getOverview(accessToken: string): Promise<{ data: AdminOverview }> {
    return this.request<{ data: AdminOverview }>("/admin/overview", {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  // --- Users ---

  async listUsers(
    accessToken: string,
    query: { cursor?: string | null; limit?: number; status?: string; role?: string; search?: string },
  ): Promise<CursorPage<AdminUserSummary>> {
    const qs = this.buildQuery({
      cursor: query.cursor ?? null,
      limit: query.limit ?? null,
      status: query.status ?? null,
      role: query.role ?? null,
      search: query.search ?? null,
    });
    return this.request<CursorPage<AdminUserSummary>>(`/admin/users${qs}`, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async getUser(accessToken: string, userId: string): Promise<{ data: AdminUserSummary }> {
    return this.request<{ data: AdminUserSummary }>(`/admin/users/${encodeURIComponent(userId)}`, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async suspendUser(
    accessToken: string,
    userId: string,
    reason?: string,
  ): Promise<{ data: unknown }> {
    return this.request<{ data: unknown }>(
      `/admin/users/${encodeURIComponent(userId)}/suspend`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify({ reason }),
      },
    );
  }

  async activateUser(accessToken: string, userId: string): Promise<{ data: unknown }> {
    return this.request<{ data: unknown }>(
      `/admin/users/${encodeURIComponent(userId)}/activate`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  // --- Tutors ---

  async listTutors(
    accessToken: string,
    query: { cursor?: string | null; limit?: number; status?: string; search?: string },
  ): Promise<CursorPage<AdminTutorSummary>> {
    const qs = this.buildQuery({
      cursor: query.cursor ?? null,
      limit: query.limit ?? null,
      status: query.status ?? null,
      search: query.search ?? null,
    });
    return this.request<CursorPage<AdminTutorSummary>>(`/admin/tutors${qs}`, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  // --- Bookings ---

  async listBookings(
    accessToken: string,
    query: { cursor?: string | null; limit?: number; status?: string },
  ): Promise<CursorPage<AdminBookingSummary>> {
    const qs = this.buildQuery({
      cursor: query.cursor ?? null,
      limit: query.limit ?? null,
      status: query.status ?? null,
    });
    return this.request<CursorPage<AdminBookingSummary>>(`/admin/bookings${qs}`, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async getBooking(accessToken: string, bookingId: string): Promise<{ data: AdminBookingSummary }> {
    return this.request<{ data: AdminBookingSummary }>(
      `/admin/bookings/${encodeURIComponent(bookingId)}`,
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async cancelBooking(
    accessToken: string,
    bookingId: string,
    reason?: string,
  ): Promise<{ data: unknown }> {
    return this.request<{ data: unknown }>(
      `/admin/bookings/${encodeURIComponent(bookingId)}/cancel`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify({ reason }),
      },
    );
  }

  // --- Payments ---

  async listPayments(
    accessToken: string,
    query: { cursor?: string | null; limit?: number; status?: string },
  ): Promise<CursorPage<AdminPaymentSummary>> {
    const qs = this.buildQuery({
      cursor: query.cursor ?? null,
      limit: query.limit ?? null,
      status: query.status ?? null,
    });
    return this.request<CursorPage<AdminPaymentSummary>>(`/admin/payments${qs}`, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  // --- Refunds ---

  async listRefunds(
    accessToken: string,
    query: { cursor?: string | null; limit?: number; status?: string },
  ): Promise<CursorPage<AdminRefundSummary>> {
    const qs = this.buildQuery({
      cursor: query.cursor ?? null,
      limit: query.limit ?? null,
      status: query.status ?? null,
    });
    return this.request<CursorPage<AdminRefundSummary>>(`/admin/refunds${qs}`, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  // --- Audit Logs ---

  async listAuditLogs(
    accessToken: string,
    query: { cursor?: string | null; limit?: number; entityType?: string; action?: string },
  ): Promise<CursorPage<AuditLogRecord>> {
    const qs = this.buildQuery({
      cursor: query.cursor ?? null,
      limit: query.limit ?? null,
      entityType: query.entityType ?? null,
      action: query.action ?? null,
    });
    return this.request<CursorPage<AuditLogRecord>>(`/admin/audit-logs${qs}`, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  // --- Verification ---

  async listVerificationCases(
    accessToken: string,
    query: { cursor?: string | null; limit?: number },
  ): Promise<ListVerificationCasesResultDto> {
    const qs = this.buildQuery({
      cursor: query.cursor ?? null,
      limit: query.limit ?? null,
    });
    return this.request<ListVerificationCasesResultDto>(`/admin/verifications${qs}`, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async getVerificationCase(
    accessToken: string,
    tutorId: string,
  ): Promise<{ data: VerificationCaseDto }> {
    return this.request<{ data: VerificationCaseDto }>(
      `/admin/verifications/${encodeURIComponent(tutorId)}`,
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async approveVerification(
    accessToken: string,
    tutorId: string,
  ): Promise<{ data: { tutorId: string; status: string; approvedAt: string } }> {
    return this.request<{ data: { tutorId: string; status: string; approvedAt: string } }>(
      `/admin/verifications/${encodeURIComponent(tutorId)}/approve`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async rejectVerification(
    accessToken: string,
    tutorId: string,
    rejectionReason: string,
  ): Promise<{ data: { tutorId: string; status: string; rejectionReason: string } }> {
    return this.request<{ data: { tutorId: string; status: string; rejectionReason: string } }>(
      `/admin/verifications/${encodeURIComponent(tutorId)}/reject`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify({ rejectionReason }),
      },
    );
  }

  async requestChangesVerification(
    accessToken: string,
    tutorId: string,
    note?: string,
  ): Promise<{ data: { tutorId: string; status: string } }> {
    return this.request<{ data: { tutorId: string; status: string } }>(
      `/admin/verifications/${encodeURIComponent(tutorId)}/request-changes`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify({ note: note ?? null }),
      },
    );
  }

  // --- Review Moderation ---

  async listReviews(
    accessToken: string,
    query: { cursor?: string | null; limit?: number; status?: string },
  ): Promise<{ data: ReviewDto[]; page: { nextCursor: string | null; hasMore: boolean; limit: number } }> {
    const qs = this.buildQuery({
      cursor: query.cursor ?? null,
      limit: query.limit ?? null,
      status: query.status ?? null,
    });
    return this.request<{ data: ReviewDto[]; page: { nextCursor: string | null; hasMore: boolean; limit: number } }>(
      `/admin/reviews${qs}`,
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async publishReview(accessToken: string, reviewId: string): Promise<{ data: ReviewDto }> {
    return this.request<{ data: ReviewDto }>(
      `/admin/reviews/${encodeURIComponent(reviewId)}/publish`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async hideReview(accessToken: string, reviewId: string): Promise<{ data: ReviewDto }> {
    return this.request<{ data: ReviewDto }>(
      `/admin/reviews/${encodeURIComponent(reviewId)}/hide`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async moderateReview(
    accessToken: string,
    reviewId: string,
    status: ReviewModerationStatus,
  ): Promise<{ data: ReviewDto }> {
    return this.request<{ data: ReviewDto }>(
      `/admin/reviews/${encodeURIComponent(reviewId)}/moderate`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify({ status }),
      },
    );
  }
}

export const adminApiClient = new AdminApiClient();
