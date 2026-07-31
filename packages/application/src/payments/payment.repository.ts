// --- Record Types ---

export interface PaymentRecord {
  id: string;
  bookingId: string;
  parentId: string;
  provider: string;
  status: string;
  amount: number; // Integer minor units (paise)
  platformFeeAmount: number;
  currency: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  idempotencyKey: string | null;
  authorizedAt: Date | null;
  capturedAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRecord {
  bookingId: string;
  parentId: string;
  provider: string;
  amount: number;
  platformFeeAmount?: number;
  currency?: string;
  idempotencyKey?: string | null;
  providerOrderId?: string | null;
}

export interface PaymentTransactionRecord {
  id: string;
  paymentId: string;
  provider: string;
  providerEventId: string | null;
  eventType: string;
  status: string;
  amount: number | null;
  payload: Record<string, any> | null;
  processedAt: Date | null;
  createdAt: Date;
}

export interface CreatePaymentTransactionRecord {
  paymentId: string;
  provider: string;
  providerEventId?: string | null;
  eventType: string;
  status: string;
  amount?: number | null;
  payload?: Record<string, any> | null;
  processedAt?: Date | null;
}

export interface PaymentWebhookRecord {
  id: string;
  paymentId: string | null;
  provider: string;
  providerEventId: string;
  eventType: string;
  status: string;
  payload: Record<string, any>;
  receivedAt: Date;
  processedAt: Date | null;
  errorMessage: string | null;
}

export interface CreatePaymentWebhookRecord {
  paymentId?: string | null;
  provider: string;
  providerEventId: string;
  eventType: string;
  status?: string;
  payload: Record<string, any>;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  bookingId: string;
  requestedByUserId: string | null;
  approvedByUserId: string | null;
  status: string;
  amount: number; // Integer minor units (paise)
  currency: string;
  reason: string | null;
  providerRefundId: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRefundRecord {
  paymentId: string;
  bookingId: string;
  requestedByUserId?: string | null;
  amount: number;
  currency?: string;
  reason?: string | null;
}

export interface PaymentQueryOptions {
  status?: string;
  provider?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface RefundQueryOptions {
  status?: string;
  paymentId?: string;
  bookingId?: string;
  limit?: number;
  offset?: number;
}

export interface PaymentSummary {
  totalPayments: number;
  totalCapturedAmount: number;
  totalRefundedAmount: number;
  pendingCount: number;
  authorizedCount: number;
  capturedCount: number;
  failedCount: number;
  refundedCount: number;
  partiallyRefundedCount: number;
}

// --- Repository Interface ---

export interface PaymentRepository {
  // Payment CRUD
  findById(id: string): Promise<PaymentRecord | null>;
  findByBookingId(bookingId: string): Promise<PaymentRecord[]>;
  findByParentId(parentId: string, opts?: PaymentQueryOptions): Promise<PaymentRecord[]>;
  findAll(opts?: PaymentQueryOptions): Promise<PaymentRecord[]>;
  findByProviderOrderId(providerOrderId: string): Promise<PaymentRecord | null>;
  findByProviderPaymentId(providerPaymentId: string): Promise<PaymentRecord | null>;
  findByIdempotencyKey(key: string): Promise<PaymentRecord | null>;
  create(data: CreatePaymentRecord): Promise<PaymentRecord>;
  updatePayment(id: string, data: Partial<PaymentRecord>): Promise<PaymentRecord>;
  updateStatus(id: string, status: string, additional?: Record<string, any>): Promise<PaymentRecord>;

  // Payment Transactions (history)
  addTransaction(entry: CreatePaymentTransactionRecord): Promise<void>;
  getTransactions(paymentId: string): Promise<PaymentTransactionRecord[]>;

  // Webhook Events
  saveWebhookEvent(data: CreatePaymentWebhookRecord): Promise<PaymentWebhookRecord>;
  findWebhookByProviderEventId(provider: string, providerEventId: string): Promise<PaymentWebhookRecord | null>;
  getUnprocessedWebhooks(): Promise<PaymentWebhookRecord[]>;
  markWebhookProcessed(id: string, paymentId: string, error?: string): Promise<void>;

  // Refunds
  createRefund(data: CreateRefundRecord): Promise<RefundRecord>;
  findRefundById(id: string): Promise<RefundRecord | null>;
  findRefundsByPaymentId(paymentId: string): Promise<RefundRecord[]>;
  findRefundsByBookingId(bookingId: string): Promise<RefundRecord[]>;
  updateRefundStatus(
    id: string,
    status: string,
    approvedByUserId?: string,
    providerRefundId?: string,
  ): Promise<RefundRecord>;

  // Dashboard
  countByStatus(status: string): Promise<number>;
  getPaymentSummary(): Promise<PaymentSummary>;

  /**
   * Run the given callback inside a Prisma interactive transaction.
   * The callback receives a repository bound to the transaction client so that
   * all payment writes within the scope are atomic.
   */
  transaction<T>(fn: (repo: PaymentRepository) => Promise<T>): Promise<T>;
}
