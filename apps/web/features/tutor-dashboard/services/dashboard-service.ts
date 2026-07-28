import type {
  TutorDashboardSummary,
  TutorBooking,
  TutorAvailability,
  TutorVerificationStatus,
} from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

class TutorDashboardApiError extends Error {
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
    this.name = "TutorDashboardApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class TutorDashboardApiClient {
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

      throw new TutorDashboardApiError(
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

  async getDashboard(
    accessToken: string,
  ): Promise<TutorDashboardSummary> {
    return this.request<TutorDashboardSummary>("/tutors/me/dashboard", {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async getAvailability(
    accessToken: string,
  ): Promise<TutorAvailability> {
    const res = await this.request<{ data: TutorAvailability }>(
      "/tutors/me/availability",
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
    return res.data;
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
  ): Promise<TutorBooking[]> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.cursor) params.set("cursor", query.cursor);

    const qs = params.toString();
    const path = `/tutors/me/bookings${qs ? `?${qs}` : ""}`;

    const res = await this.request<{ data: TutorBooking[] }>(path, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
    return res.data;
  }

  async getVerificationStatus(
    accessToken: string,
  ): Promise<TutorVerificationStatus> {
    return this.request<TutorVerificationStatus>("/tutors/me/verification", {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
  }

  async acceptBooking(
    accessToken: string,
    bookingId: string,
  ): Promise<{ data: Record<string, unknown> }> {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/accept`, {
      method: "POST",
      headers: this.authHeaders(accessToken),
    });
  }

  async rejectBooking(
    accessToken: string,
    bookingId: string,
  ): Promise<{ data: Record<string, unknown> }> {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/reject`, {
      method: "POST",
      headers: this.authHeaders(accessToken),
    });
  }

  async updateWeeklySlot(
    accessToken: string,
    slotId: string,
    data: {
      dayOfWeek?: string;
      startTime?: string;
      endTime?: string;
      serviceMode?: string;
      timezone?: string;
      capacity?: number;
    },
  ): Promise<{ data: TutorAvailability["weeklySlots"][number] }> {
    return this.request<{ data: TutorAvailability["weeklySlots"][number] }>(
      `/tutors/me/availability/weekly-slots/${encodeURIComponent(slotId)}`,
      {
        method: "PATCH",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify(data),
      },
    );
  }

  async removeWeeklySlot(
    accessToken: string,
    slotId: string,
  ): Promise<void> {
    await this.request(
      `/tutors/me/availability/weekly-slots/${encodeURIComponent(slotId)}`,
      {
        method: "DELETE",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async removeBreakPeriod(
    accessToken: string,
    breakId: string,
  ): Promise<void> {
    await this.request(
      `/tutors/me/availability/break-periods/${encodeURIComponent(breakId)}`,
      {
        method: "DELETE",
        headers: this.authHeaders(accessToken),
      },
    );
  }

  async listSubjects(
    accessToken: string,
  ): Promise<string[]> {
    const res = await this.request<{ data: { subjectName: string }[] }>("/tutors/me/subjects", {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });
    return res.data.map((item) => item.subjectName);
  }

  async listServiceAreas(
    accessToken: string,
  ): Promise<string[]> {
    const res = await this.request<{ data: { city: string }[] }>(
      "/tutors/me/service-areas",
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
    return res.data.map((item) => item.city);
  }

  async listLanguages(
    accessToken: string,
  ): Promise<string[]> {
    const res = await this.request<{ data: { language: string }[] }>(
      "/tutors/me/languages",
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
    return res.data.map((item) => item.language);
  }

  async addBreakPeriod(
    accessToken: string,
    data: {
      dayOfWeek?: string | null;
      startTime: string;
      endTime: string;
      reason?: string | null;
    },
  ): Promise<{ data: TutorAvailability["breaks"][number] }> {
    return this.request<{ data: TutorAvailability["breaks"][number] }>(
      "/tutors/me/availability/break-periods",
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify(data),
      },
    );
  }

  async addWeeklySlot(
    accessToken: string,
    data: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      serviceMode: string;
      timezone?: string;
      capacity?: number;
    },
  ): Promise<{ data: TutorAvailability["weeklySlots"][number] }> {
    return this.request<{ data: TutorAvailability["weeklySlots"][number] }>(
      "/tutors/me/availability/weekly-slots",
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify(data),
      },
    );
  }
}

const client = new TutorDashboardApiClient();

export async function fetchTutorDashboard(accessToken: string) {
  return client.getDashboard(accessToken);
}

export async function fetchTutorAvailability(accessToken: string) {
  return client.getAvailability(accessToken);
}

export async function fetchTutorBookings(accessToken: string, query?: {
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}) {
  return client.listBookings(accessToken, query);
}

export async function fetchTutorVerificationStatus(accessToken: string) {
  return client.getVerificationStatus(accessToken);
}

export async function acceptTutorBooking(accessToken: string, bookingId: string) {
  return client.acceptBooking(accessToken, bookingId);
}

export async function rejectTutorBooking(accessToken: string, bookingId: string) {
  return client.rejectBooking(accessToken, bookingId);
}

export async function updateTutorWeeklySlot(
  accessToken: string,
  slotId: string,
  data: {
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    serviceMode?: string;
    timezone?: string;
    capacity?: number;
  },
) {
  return client.updateWeeklySlot(accessToken, slotId, data);
}

export async function removeTutorWeeklySlot(
  accessToken: string,
  slotId: string,
) {
  return client.removeWeeklySlot(accessToken, slotId);
}

export async function removeTutorBreakPeriod(
  accessToken: string,
  breakId: string,
) {
  return client.removeBreakPeriod(accessToken, breakId);
}

export async function addTutorBreakPeriod(
  accessToken: string,
  data: {
    dayOfWeek?: string | null;
    startTime: string;
    endTime: string;
    reason?: string | null;
  },
) {
  return client.addBreakPeriod(accessToken, data);
}

export async function addTutorWeeklySlot(
  accessToken: string,
  data: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    serviceMode: string;
    timezone?: string;
    capacity?: number;
  },
) {
  return client.addWeeklySlot(accessToken, data);
}

export async function listTutorSubjects(accessToken: string) {
  return client.listSubjects(accessToken);
}

export async function listTutorServiceAreas(accessToken: string) {
  return client.listServiceAreas(accessToken);
}

export async function listTutorLanguages(accessToken: string) {
  return client.listLanguages(accessToken);
}