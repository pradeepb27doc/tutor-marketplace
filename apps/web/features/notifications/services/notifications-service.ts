const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

class NotificationsApiError extends Error {
  public code: string;
  public status: number;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "NotificationsApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class NotificationsApiClient {
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

      throw new NotificationsApiError(
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

  async listNotifications(
    accessToken: string,
    query: {
      limit?: number;
      offset?: number;
      cursor?: string | null;
      unreadOnly?: boolean;
    } = {},
  ) {
    const searchParams = new URLSearchParams();
    if (typeof query.limit === "number") searchParams.set("limit", String(query.limit));
    if (typeof query.offset === "number") searchParams.set("offset", String(query.offset));
    if (typeof query.cursor === "string") searchParams.set("cursor", query.cursor);
    if (typeof query.unreadOnly === "boolean") searchParams.set("unreadOnly", String(query.unreadOnly));

    const qs = searchParams.toString();
    const path = `/notifications${qs ? `?${qs}` : ""}`;

    const response = await this.request<{
      data: import("../types").NotificationDto[];
      page: import("../types").CursorPage;
    }>(path, {
      method: "GET",
      headers: this.authHeaders(accessToken),
    });

    return response;
  }

  async markNotificationRead(
    accessToken: string,
    notificationId: string,
  ): Promise<{ marked: boolean }> {
    const response = await this.request<{ marked: boolean }>(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      {
        method: "PATCH",
        headers: this.authHeaders(accessToken),
      },
    );
    return response;
  }

  async getPreferences(accessToken: string) {
    const response = await this.request<import("../types").NotificationPreferencesResponse>(
      "/me/preferences",
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
    return response;
  }

  async updatePreference(
    accessToken: string,
    body: {
      channel: string;
      category: string;
      enabled: boolean;
    },
  ) {
    const response = await this.request<{
      preference: {
        id: string;
        channel: string;
        category: string;
        enabled: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>("/me/preferences", {
      method: "PATCH",
      headers: this.authHeaders(accessToken),
      body: JSON.stringify(body),
    });
    return response;
  }
}

export const notificationsApiClient = new NotificationsApiClient();
export { NotificationsApiError };
export type { NotificationsApiClient };