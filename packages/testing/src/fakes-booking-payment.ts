import type {
  BookingQueryOptions,
  BookingRecord,
  BookingRepository,
  CreateBookingRecord,
  CreateStatusHistoryRecord,
  CreateConcreteSlotRecord,
  CreatePaymentRecord,
  CreatePaymentTransactionRecord,
  CreatePaymentWebhookRecord,
  CreateRefundRecord,
  ParentRecord,
  PaymentGatewayPort,
  PaymentQueryOptions,
  PaymentRecord,
  PaymentRepository,
  PaymentSummary,
  PaymentTransactionRecord,
  PaymentWebhookRecord,
  RefundRecord,
  TutorAvailabilitySlotRecord,
  TutorAvailabilitySlotRepository,
} from "@tutor-marketplace/application";
import type { GatewayPaymentStatusResult } from "@tutor-marketplace/application";

let _seq = 0;
function nextId(prefix: string): string {
  _seq += 1;
  return `${prefix}-${_seq}`;
}

export class FakeParentProfileRepository {
  public parents: ParentRecord[] = [];

  async findByUserId(userId: string): Promise<ParentRecord | null> {
    return this.parents.find((p) => p.userId === userId) ?? null;
  }

  async updateByUserId(userId: string, data: Partial<ParentRecord>): Promise<ParentRecord> {
    const idx = this.parents.findIndex((p) => p.userId === userId);
    if (idx === -1) throw new Error("Parent not found");
    this.parents[idx] = { ...this.parents[idx], ...data, updatedAt: new Date() };
    return this.parents[idx];
  }
}

export class FakeStudentOwnershipRepository {
  public students: Array<{ id: string; parentId: string }> = [];

  async findById(id: string): Promise<{ id: string } | null> {
    return this.students.find((s) => s.id === id) ? { id } : null;
  }

  async verifyParentOwnership(studentId: string, parentId: string): Promise<boolean> {
    return this.students.some((s) => s.id === studentId && s.parentId === parentId);
  }
}

export class FakeBookingRepository implements BookingRepository {
  public bookings: BookingRecord[] = [];
  public history: CreateStatusHistoryRecord[] = [];

  async findById(id: string): Promise<BookingRecord | null> {
    return this.bookings.find((b) => b.id === id) ?? null;
  }

  async findByPublicId(publicId: string): Promise<BookingRecord | null> {
    return this.bookings.find((b) => b.publicId === publicId) ?? null;
  }

  async findByParentId(parentId: string, opts?: BookingQueryOptions): Promise<BookingRecord[]> {
    return this.filter(this.bookings.filter((b) => b.parentId === parentId), opts);
  }

  async findByTutorId(tutorId: string, opts?: BookingQueryOptions): Promise<BookingRecord[]> {
    return this.filter(this.bookings.filter((b) => b.tutorId === tutorId), opts);
  }

  async findByTutorIdAndTimeRange(tutorId: string, startAt: Date, endAt: Date): Promise<BookingRecord[]> {
    return this.findOverlapping(tutorId, startAt, endAt);
  }

  async findBySlotId(slotId: string): Promise<BookingRecord | null> {
    return this.bookings.find((b) => b.availabilitySlotId === slotId) ?? null;
  }

  async findOverlapping(tutorId: string, startAt: Date, endAt: Date, excludeBookingId?: string): Promise<BookingRecord[]> {
    return this.bookings.filter(
      (b) =>
        b.tutorId === tutorId &&
        b.id !== excludeBookingId &&
        ["REQUESTED", "ACCEPTED", "PENDING_PAYMENT", "PAYMENT_AUTHORIZED"].includes(b.status) &&
        startAt < b.endAt &&
        b.startAt < endAt,
    );
  }

  async create(data: CreateBookingRecord): Promise<BookingRecord> {
    const now = new Date();
    const record: BookingRecord = {
      id: nextId("booking"),
      publicId: `pub-${nextId("booking")}`,
      parentId: data.parentId,
      studentId: data.studentId,
      tutorId: data.tutorId,
      subjectId: data.subjectId,
      tutorSubjectId: data.tutorSubjectId ?? null,
      availabilitySlotId: data.availabilitySlotId ?? null,
      classType: data.classType ?? "REGULAR",
      serviceMode: data.serviceMode,
      status: "REQUESTED",
      startAt: data.startAt,
      endAt: data.endAt,
      timezone: data.timezone ?? "Asia/Kolkata",
      durationMinutes: data.durationMinutes,
      city: data.city ?? null,
      address: data.address ?? null,
      meetingUrl: null,
      priceAmount: data.priceAmount,
      platformFeeAmount: data.platformFeeAmount ?? "0.00",
      tutorEarningsAmount: data.tutorEarningsAmount ?? data.priceAmount,
      currency: data.currency ?? "INR",
      cancellationReason: null,
      rescheduledFromBookingId: data.rescheduledFromBookingId ?? null,
      acceptedAt: null,
      rejectedAt: null,
      cancelledAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.bookings.push(record);
    return record;
  }

  async updateStatus(id: string, status: string, _changedByUserId?: string | null, reason?: string | null): Promise<BookingRecord> {
    const booking = await this.findById(id);
    if (!booking) throw new Error("Booking not found");
    booking.status = status;
    booking.updatedAt = new Date();
    if (status === "ACCEPTED") booking.acceptedAt = booking.updatedAt;
    if (status === "REJECTED") booking.rejectedAt = booking.updatedAt;
    if (status.startsWith("CANCELLED")) {
      booking.cancelledAt = booking.updatedAt;
      booking.cancellationReason = reason ?? null;
    }
    if (status === "COMPLETED") booking.completedAt = booking.updatedAt;
    return booking;
  }

  async addStatusHistory(entry: CreateStatusHistoryRecord): Promise<void> {
    this.history.push(entry);
  }

  async countByTutorIdAndStatus(tutorId: string, status: string): Promise<number> {
    return this.bookings.filter((b) => b.tutorId === tutorId && b.status === status).length;
  }

  private filter(records: BookingRecord[], opts?: BookingQueryOptions): BookingRecord[] {
    let result = records;
    if (opts?.status) result = result.filter((b) => b.status === opts.status);
    if (opts?.from) {
      const fromDate = typeof opts.from === "string" ? new Date(opts.from) : opts.from;
      result = result.filter((b) => b.startAt >= fromDate);
    }
    if (opts?.to) {
      const toDate = typeof opts.to === "string" ? new Date(opts.to) : opts.to;
      result = result.filter((b) => b.endAt <= toDate);
    }
    return result.slice(opts?.offset ?? 0, opts?.limit ? (opts.offset ?? 0) + opts.limit : undefined);
  }
}

export class FakeTutorAvailabilitySlotRepository implements TutorAvailabilitySlotRepository {
  public slots: TutorAvailabilitySlotRecord[] = [];

  async findById(id: string): Promise<TutorAvailabilitySlotRecord | null> {
    return this.slots.find((s) => s.id === id) ?? null;
  }

  async findAvailableById(id: string): Promise<TutorAvailabilitySlotRecord | null> {
    const slot = await this.findById(id);
    return slot?.status === "AVAILABLE" ? slot : null;
  }

  async reserveSlot(id: string, reservedByParentId: string, reservedUntil: Date): Promise<void> {
    const slot = await this.findById(id);
    if (slot) Object.assign(slot, { status: "RESERVED", reservedByParentId, reservedUntil, updatedAt: new Date() });
  }

  async markAsBooked(id: string): Promise<void> {
    const slot = await this.findById(id);
    if (slot) Object.assign(slot, { status: "BOOKED", updatedAt: new Date() });
  }

  async releaseSlot(id: string): Promise<void> {
    const slot = await this.findById(id);
    if (slot) Object.assign(slot, { status: "AVAILABLE", reservedByParentId: null, reservedUntil: null, updatedAt: new Date() });
  }

  async markAsExpired(id: string): Promise<void> {
    const slot = await this.findById(id);
    if (slot) Object.assign(slot, { status: "EXPIRED", updatedAt: new Date() });
  }

  async createConcreteSlot(data: CreateConcreteSlotRecord): Promise<TutorAvailabilitySlotRecord> {
    const now = new Date();
    const slot: TutorAvailabilitySlotRecord = {
      id: nextId("slot"),
      tutorId: data.tutorId,
      startAt: data.startAt,
      endAt: data.endAt,
      timezone: data.timezone ?? "Asia/Kolkata",
      status: "AVAILABLE",
      serviceMode: data.serviceMode,
      capacity: data.capacity ?? 1,
      reservedUntil: null,
      reservedByParentId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.slots.push(slot);
    return slot;
  }
}

export class FakePaymentRepository implements PaymentRepository {
  public payments: PaymentRecord[] = [];
  public transactions: PaymentTransactionRecord[] = [];
  public refunds: RefundRecord[] = [];
  public webhooks: PaymentWebhookRecord[] = [];

  async findById(id: string): Promise<PaymentRecord | null> {
    return this.payments.find((p) => p.id === id) ?? null;
  }
  async findByBookingId(bookingId: string): Promise<PaymentRecord[]> {
    return this.payments.filter((p) => p.bookingId === bookingId);
  }
  async findByParentId(parentId: string, opts?: PaymentQueryOptions): Promise<PaymentRecord[]> {
    return this.filter(this.payments.filter((p) => p.parentId === parentId), opts);
  }
  async findAll(opts?: PaymentQueryOptions): Promise<PaymentRecord[]> {
    return this.filter(this.payments, opts);
  }
  async findByProviderOrderId(providerOrderId: string): Promise<PaymentRecord | null> {
    return this.payments.find((p) => p.providerOrderId === providerOrderId) ?? null;
  }
  async findByProviderPaymentId(providerPaymentId: string): Promise<PaymentRecord | null> {
    return this.payments.find((p) => p.providerPaymentId === providerPaymentId) ?? null;
  }
  async findByIdempotencyKey(key: string): Promise<PaymentRecord | null> {
    return this.payments.find((p) => p.idempotencyKey === key) ?? null;
  }
  async create(data: CreatePaymentRecord): Promise<PaymentRecord> {
    const now = new Date();
    const payment: PaymentRecord = {
      id: nextId("payment"),
      bookingId: data.bookingId,
      parentId: data.parentId,
      provider: data.provider,
      status: "PENDING",
      amount: data.amount,
      platformFeeAmount: data.platformFeeAmount ?? 0,
      currency: data.currency ?? "INR",
      providerOrderId: data.providerOrderId ?? null,
      providerPaymentId: null,
      idempotencyKey: data.idempotencyKey ?? null,
      authorizedAt: null,
      capturedAt: null,
      failedAt: null,
      failureReason: null,
      metadata: null,
      createdAt: now,
      updatedAt: now,
    };
    this.payments.push(payment);
    return payment;
  }
  async updatePayment(id: string, data: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const payment = await this.findById(id);
    if (!payment) throw new Error("Payment not found");
    Object.assign(payment, data, { updatedAt: new Date() });
    return payment;
  }
  async updateStatus(id: string, status: string, additional?: Record<string, any>): Promise<PaymentRecord> {
    return this.updatePayment(id, { ...additional, status } as Partial<PaymentRecord>);
  }
  async addTransaction(entry: CreatePaymentTransactionRecord): Promise<void> {
    this.transactions.push({
      id: nextId("txn"),
      paymentId: entry.paymentId,
      provider: entry.provider,
      providerEventId: entry.providerEventId ?? null,
      eventType: entry.eventType,
      status: entry.status,
      amount: entry.amount ?? null,
      payload: entry.payload ?? null,
      processedAt: entry.processedAt ?? null,
      createdAt: new Date(),
    });
  }
  async getTransactions(paymentId: string): Promise<PaymentTransactionRecord[]> {
    return this.transactions.filter((t) => t.paymentId === paymentId);
  }
  async saveWebhookEvent(data: CreatePaymentWebhookRecord): Promise<PaymentWebhookRecord> {
    const webhook: PaymentWebhookRecord = { id: nextId("webhook"), paymentId: data.paymentId ?? null, provider: data.provider, providerEventId: data.providerEventId, eventType: data.eventType, status: data.status ?? "RECEIVED", payload: data.payload, receivedAt: new Date(), processedAt: null, errorMessage: null };
    this.webhooks.push(webhook);
    return webhook;
  }
  async findWebhookByProviderEventId(provider: string, providerEventId: string): Promise<PaymentWebhookRecord | null> {
    return this.webhooks.find((w) => w.provider === provider && w.providerEventId === providerEventId) ?? null;
  }
  async getUnprocessedWebhooks(): Promise<PaymentWebhookRecord[]> {
    return this.webhooks.filter((w) => !w.processedAt);
  }
  async markWebhookProcessed(id: string, paymentId: string, error?: string): Promise<void> {
    const webhook = this.webhooks.find((w) => w.id === id);
    if (webhook) Object.assign(webhook, { paymentId, processedAt: new Date(), status: error ? "FAILED" : "PROCESSED", errorMessage: error ?? null });
  }
  async createRefund(data: CreateRefundRecord): Promise<RefundRecord> {
    const now = new Date();
    const refund: RefundRecord = { id: nextId("refund"), paymentId: data.paymentId, bookingId: data.bookingId, requestedByUserId: data.requestedByUserId ?? null, approvedByUserId: null, status: "REQUESTED", amount: data.amount, currency: data.currency ?? "INR", reason: data.reason ?? null, providerRefundId: null, processedAt: null, createdAt: now, updatedAt: now };
    this.refunds.push(refund);
    return refund;
  }
  async findRefundById(id: string): Promise<RefundRecord | null> {
    return this.refunds.find((r) => r.id === id) ?? null;
  }
  async findRefundsByPaymentId(paymentId: string): Promise<RefundRecord[]> {
    return this.refunds.filter((r) => r.paymentId === paymentId);
  }
  async findRefundsByBookingId(bookingId: string): Promise<RefundRecord[]> {
    return this.refunds.filter((r) => r.bookingId === bookingId);
  }
  async updateRefundStatus(id: string, status: string, approvedByUserId?: string, providerRefundId?: string): Promise<RefundRecord> {
    const refund = await this.findRefundById(id);
    if (!refund) throw new Error("Refund not found");
    Object.assign(refund, { status, approvedByUserId: approvedByUserId ?? refund.approvedByUserId, providerRefundId: providerRefundId ?? refund.providerRefundId, processedAt: ["PROCESSED", "REJECTED"].includes(status) ? new Date() : refund.processedAt, updatedAt: new Date() });
    return refund;
  }
  async countByStatus(status: string): Promise<number> {
    return this.payments.filter((p) => p.status === status).length;
  }
  async getPaymentSummary(): Promise<PaymentSummary> {
    return {
      totalPayments: this.payments.length,
      totalCapturedAmount: this.payments.filter((p) => p.status === "CAPTURED").reduce((sum, p) => sum + p.amount, 0),
      totalRefundedAmount: this.refunds.filter((r) => r.status === "PROCESSED").reduce((sum, r) => sum + r.amount, 0),
      pendingCount: await this.countByStatus("PENDING"),
      authorizedCount: await this.countByStatus("AUTHORIZED"),
      capturedCount: await this.countByStatus("CAPTURED"),
      failedCount: await this.countByStatus("FAILED"),
      refundedCount: await this.countByStatus("REFUNDED"),
      partiallyRefundedCount: await this.countByStatus("PARTIALLY_REFUNDED"),
    };
  }
  async transaction<T>(fn: (repo: PaymentRepository) => Promise<T>): Promise<T> {
    return fn(this);
  }
  private filter(records: PaymentRecord[], opts?: PaymentQueryOptions): PaymentRecord[] {
    let result = records;
    if (opts?.status) result = result.filter((p) => p.status === opts.status);
    if (opts?.provider) result = result.filter((p) => p.provider === opts.provider);
    return result.slice(opts?.offset ?? 0, opts?.limit ? (opts.offset ?? 0) + opts.limit : undefined);
  }
}

export class FakePaymentGateway implements PaymentGatewayPort {
  readonly providerName = "RAZORPAY";
  public nextVerificationResult = true;
  public nextCaptureResult = true;
  public createdOrders: any[] = [];
  public refunds: any[] = [];

  async createOrder(params: any) {
    this.createdOrders.push(params);
    return { providerOrderId: nextId("order"), amount: params.amount, currency: params.currency, status: "created", gatewayData: { provider: this.providerName, amount: params.amount } };
  }
  async verifyPayment(params: any) {
    return { verified: this.nextVerificationResult, status: this.nextVerificationResult ? "authorized" : "failed", amount: 50000, currency: "INR", providerPaymentId: params.providerPaymentId };
  }
  async capturePayment(params: any) {
    return { captured: this.nextCaptureResult, status: this.nextCaptureResult ? "captured" : "failed", providerPaymentId: params.providerPaymentId };
  }
  async refund(params: any) {
    this.refunds.push(params);
    return { providerRefundId: nextId("provider-refund"), status: "processed", amount: params.amount };
  }
  async getPaymentStatus(providerPaymentId: string): Promise<GatewayPaymentStatusResult> {
    return { providerPaymentId, status: "captured", amount: 50000, currency: "INR", failureReason: null };
  }
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    return signature === `valid-${secret}` || payload.length > 0;
  }
}