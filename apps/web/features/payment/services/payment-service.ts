import type {
  PaymentOrderApiResponse,
  PaymentApiResponse,
  PaymentWithTransactionsApiResponse,
  PaymentOrderDto,
  PaymentDto,
  PaymentWithTransactionsDto,
  RazorpayVerifyPayload,
} from "../types";
import { bookingApiClient } from "@/features/booking/services/booking-service";
import type { BookingApiResponse } from "@/features/booking/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

class PaymentApiError extends Error {
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
    this.name = "PaymentApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class PaymentApiClient {
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

      throw new PaymentApiError(
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

  // --- Payment Order ---

  async createPaymentOrder(
    bookingId: string,
    accessToken: string,
    provider?: string,
    idempotencyKey?: string,
  ): Promise<PaymentOrderDto> {
    const body: Record<string, unknown> = { bookingId };
    if (provider) body.provider = provider;
    if (idempotencyKey) body.idempotencyKey = idempotencyKey;

    const response = await this.request<PaymentOrderApiResponse>(
      "/payments/orders",
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify(body),
      },
    );
    return response.data;
  }

  async retryPaymentOrder(
    bookingId: string,
    accessToken: string,
    provider?: string,
    idempotencyKey?: string,
  ): Promise<PaymentOrderDto> {
    const body: Record<string, unknown> = { bookingId };
    if (provider) body.provider = provider;
    if (idempotencyKey) body.idempotencyKey = idempotencyKey;

    const response = await this.request<PaymentOrderApiResponse>(
      `/bookings/${encodeURIComponent(bookingId)}/payments/retry`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify(body),
      },
    );
    return response.data;
  }

  // --- Verify Payment ---

  async verifyPayment(
    paymentId: string,
    payload: RazorpayVerifyPayload,
    accessToken: string,
  ): Promise<PaymentDto> {
    const response = await this.request<PaymentApiResponse>(
      `/payments/${encodeURIComponent(paymentId)}/confirm-client-result`,
      {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: JSON.stringify({
          providerOrderId: payload.providerOrderId,
          providerPaymentId: payload.providerPaymentId,
          signature: payload.signature,
        }),
      },
    );
    return response.data;
  }

  // --- Get Payment ---

  async getPayment(
    paymentId: string,
    accessToken: string,
  ): Promise<PaymentWithTransactionsDto> {
    const response = await this.request<PaymentWithTransactionsApiResponse>(
      `/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: this.authHeaders(accessToken),
      },
    );
    return response.data;
  }

  // --- Get Booking (reuses booking API client) ---

  async getBooking(
    bookingId: string,
    accessToken: string,
  ): Promise<BookingApiResponse> {
    return bookingApiClient.getBooking(bookingId, accessToken);
  }
}

export const paymentApiClient = new PaymentApiClient();
export { PaymentApiError };
export type { PaymentApiClient };
