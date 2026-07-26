  import type {
  PaymentRepository,
  PaymentRecord,
  CreatePaymentRecord,
  PaymentTransactionRecord,
  CreatePaymentTransactionRecord,
  PaymentWebhookRecord,
  CreatePaymentWebhookRecord,
  RefundRecord,
  CreateRefundRecord,
  PaymentQueryOptions,
  PaymentSummary,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

type PrismaTransaction = ReturnType<typeof getPrismaClient>;

export class PrismaPaymentRepository implements PaymentRepository {
  private get db(): PrismaTransaction {
    return getPrismaClient();
  }

  // --- Payment CRUD ---

  async findById(id: string): Promise<PaymentRecord | null> {
    const record: any = await this.db.payment.findUnique({ where: { id } });
    return record ? this.toRecord(record) : null;
  }

  async transaction<T>(fn: (repo: PaymentRepository) => Promise<T>): Promise<T> {
    const prisma = getPrismaClient();
    return prisma.$transaction(async (tx: any) => {
      const bound: PrismaPaymentRepository = Object.create(PrismaPaymentRepository.prototype);
      Object.defineProperties(bound, {
        db: { get: () => tx },
      });
      return fn(bound as unknown as PaymentRepository);
    });
  }

  async findByBookingId(bookingId: string): Promise<PaymentRecord[]> {
    const records: any[] = await this.db.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r) => this.toRecord(r));
  }

  async findByParentId(parentId: string, opts?: PaymentQueryOptions): Promise<PaymentRecord[]> {
    const where: any = { parentId };
    if (opts?.status) where.status = opts.status;
    if (opts?.provider) where.provider = opts.provider;
    if (opts?.from || opts?.to) {
      where.createdAt = {};
      if (opts?.from) where.createdAt.gte = opts.from;
      if (opts?.to) where.createdAt.lte = opts.to;
    }
    const records: any[] = await this.db.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: opts?.limit,
      skip: opts?.offset,
    });
    return records.map((r) => this.toRecord(r));
  }

  async findAll(opts?: PaymentQueryOptions): Promise<PaymentRecord[]> {
    const where: any = {};
    if (opts?.status) where.status = opts.status;
    if (opts?.provider) where.provider = opts.provider;
    if (opts?.from || opts?.to) {
      where.createdAt = {};
      if (opts?.from) where.createdAt.gte = opts.from;
      if (opts?.to) where.createdAt.lte = opts.to;
    }
    const records: any[] = await this.db.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: opts?.limit,
      skip: opts?.offset,
    });
    return records.map((r) => this.toRecord(r));
  }

  async findByProviderOrderId(providerOrderId: string): Promise<PaymentRecord | null> {
    const record: any = await this.db.payment.findUnique({ where: { providerOrderId } });
    return record ? this.toRecord(record) : null;
  }

  async findByProviderPaymentId(providerPaymentId: string): Promise<PaymentRecord | null> {
    const record: any = await this.db.payment.findUnique({ where: { providerPaymentId } });
    return record ? this.toRecord(record) : null;
  }

  async findByIdempotencyKey(key: string): Promise<PaymentRecord | null> {
    const record: any = await this.db.payment.findUnique({ where: { idempotencyKey: key } });
    return record ? this.toRecord(record) : null;
  }

  async create(data: CreatePaymentRecord): Promise<PaymentRecord> {
    const record: any = await this.db.payment.create({
      data: {
        bookingId: data.bookingId,
        parentId: data.parentId,
        provider: data.provider as any,
        amount: data.amount,
        platformFeeAmount: data.platformFeeAmount ?? 0,
        currency: data.currency ?? "INR",
        idempotencyKey: data.idempotencyKey ?? null,
        providerOrderId: data.providerOrderId ?? null,
        status: "PENDING" as any,
      },
    });
    return this.toRecord(record);
  }

  async updatePayment(id: string, data: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.providerPaymentId !== undefined) updateData.providerPaymentId = data.providerPaymentId;
    if (data.authorizedAt !== undefined) updateData.authorizedAt = data.authorizedAt;
    if (data.capturedAt !== undefined) updateData.capturedAt = data.capturedAt;
    if (data.failedAt !== undefined) updateData.failedAt = data.failedAt;
    if (data.failureReason !== undefined) updateData.failureReason = data.failureReason;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;
    const record: any = await this.db.payment.update({ where: { id }, data: updateData });
    return this.toRecord(record);
  }

  async updateStatus(
    id: string,
    status: string,
    additional?: Record<string, any>,
  ): Promise<PaymentRecord> {
    const updateData: any = { status: status as any };
    if (additional) {
      if (additional.providerPaymentId !== undefined)
        updateData.providerPaymentId = additional.providerPaymentId;
      if (additional.authorizedAt !== undefined) updateData.authorizedAt = additional.authorizedAt;
      if (additional.capturedAt !== undefined) updateData.capturedAt = additional.capturedAt;
      if (additional.failedAt !== undefined) updateData.failedAt = additional.failedAt;
      if (additional.failureReason !== undefined) updateData.failureReason = additional.failureReason;
      if (additional.metadata !== undefined) updateData.metadata = additional.metadata;
    }
    const record: any = await this.db.payment.update({ where: { id }, data: updateData });
    return this.toRecord(record);
  }

  // --- Payment Transactions ---

  async addTransaction(entry: CreatePaymentTransactionRecord): Promise<void> {
    await this.db.paymentTransaction.create({
      data: {
        paymentId: entry.paymentId,
        provider: entry.provider as any,
        providerEventId: entry.providerEventId ?? null,
        eventType: entry.eventType,
        status: entry.status as any,
        amount: entry.amount ?? null,
        payload: entry.payload ?? undefined,
        processedAt: entry.processedAt ?? null,
      },
    });
  }

  async getTransactions(paymentId: string): Promise<PaymentTransactionRecord[]> {
    const records: any[] = await this.db.paymentTransaction.findMany({
      where: { paymentId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => this.toTransactionRecord(r));
  }

  // --- Webhook Events ---

  async saveWebhookEvent(data: CreatePaymentWebhookRecord): Promise<PaymentWebhookRecord> {
    const record: any = await this.db.paymentWebhookEvent.create({
      data: {
        provider: data.provider as any,
        providerEventId: data.providerEventId,
        eventType: data.eventType,
        status: (data.status ?? "RECEIVED") as any,
        payload: data.payload,
        paymentId: data.paymentId ?? null,
      },
    });
    return this.toWebhookRecord(record);
  }

  async findWebhookByProviderEventId(
    provider: string,
    providerEventId: string,
  ): Promise<PaymentWebhookRecord | null> {
    const record: any = await this.db.paymentWebhookEvent.findUnique({
      where: { provider: provider as any, providerEventId },
    });
    return record ? this.toWebhookRecord(record) : null;
  }

  async getUnprocessedWebhooks(): Promise<PaymentWebhookRecord[]> {
    const records: any[] = await this.db.paymentWebhookEvent.findMany({
      where: { status: "RECEIVED" as any },
    });
    return records.map((r) => this.toWebhookRecord(r));
  }

  async markWebhookProcessed(id: string, paymentId: string, error?: string): Promise<void> {
    await this.db.paymentWebhookEvent.update({
      where: { id },
      data: {
        status: error ? ("FAILED" as any) : ("PROCESSED" as any),
        processedAt: new Date(),
        errorMessage: error ?? null,
        paymentId: paymentId || undefined,
      },
    });
  }

  // --- Refunds ---

  async createRefund(data: CreateRefundRecord): Promise<RefundRecord> {
    const record: any = await this.db.refund.create({
      data: {
        paymentId: data.paymentId,
        bookingId: data.bookingId,
        requestedByUserId: data.requestedByUserId ?? null,
        amount: data.amount,
        currency: data.currency ?? "INR",
        reason: data.reason ?? null,
        status: "REQUESTED" as any,
      },
    });
    return this.toRefundRecord(record);
  }

  async findRefundById(id: string): Promise<RefundRecord | null> {
    const record: any = await this.db.refund.findUnique({ where: { id } });
    return record ? this.toRefundRecord(record) : null;
  }

  async findRefundsByPaymentId(paymentId: string): Promise<RefundRecord[]> {
    const records: any[] = await this.db.refund.findMany({
      where: { paymentId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => this.toRefundRecord(r));
  }

  async findRefundsByBookingId(bookingId: string): Promise<RefundRecord[]> {
    const records: any[] = await this.db.refund.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => this.toRefundRecord(r));
  }

  async updateRefundStatus(
    id: string,
    status: string,
    approvedByUserId?: string,
    providerRefundId?: string,
  ): Promise<RefundRecord> {
    const updateData: any = { status: status as any };
    if (approvedByUserId !== undefined) updateData.approvedByUserId = approvedByUserId;
    if (providerRefundId !== undefined) updateData.providerRefundId = providerRefundId;
    if (status === "PROCESSED") updateData.processedAt = new Date();
    const record: any = await this.db.refund.update({ where: { id }, data: updateData });
    return this.toRefundRecord(record);
  }

  // --- Dashboard ---

  async countByStatus(status: string): Promise<number> {
    return this.db.payment.count({ where: { status: status as any } });
  }

  async getPaymentSummary(): Promise<PaymentSummary> {
    const [
      totalPayments,
      captured,
      refunded,
      pendingCount,
      authorizedCount,
      capturedCount,
      failedCount,
      refundedCount,
      partiallyRefundedCount,
    ] = await Promise.all([
      this.db.payment.count(),
      this.db.payment.aggregate({ _sum: { amount: true }, where: { status: "CAPTURED" as any } }),
      this.db.refund.aggregate({ _sum: { amount: true }, where: { status: "PROCESSED" as any } }),
      this.db.payment.count({ where: { status: "PENDING" as any } }),
      this.db.payment.count({ where: { status: "AUTHORIZED" as any } }),
      this.db.payment.count({ where: { status: "CAPTURED" as any } }),
      this.db.payment.count({ where: { status: "FAILED" as any } }),
      this.db.payment.count({ where: { status: "REFUNDED" as any } }),
      this.db.payment.count({ where: { status: "PARTIALLY_REFUNDED" as any } }),
    ]);

    return {
      totalPayments,
      totalCapturedAmount: captured._sum.amount != null ? Number(captured._sum.amount) : 0,
      totalRefundedAmount: refunded._sum.amount != null ? Number(refunded._sum.amount) : 0,
      pendingCount,
      authorizedCount,
      capturedCount,
      failedCount,
      refundedCount,
      partiallyRefundedCount,
    };
  }

  // --- Mappers ---

  private toRecord(record: any): PaymentRecord {
    return {
      id: record.id,
      bookingId: record.bookingId,
      parentId: record.parentId,
      provider: record.provider,
      status: record.status,
      amount: record.amount != null ? Number(record.amount) : 0,
      platformFeeAmount: record.platformFeeAmount != null ? Number(record.platformFeeAmount) : 0,
      currency: record.currency,
      providerOrderId: record.providerOrderId ?? null,
      providerPaymentId: record.providerPaymentId ?? null,
      idempotencyKey: record.idempotencyKey ?? null,
      authorizedAt: record.authorizedAt ?? null,
      capturedAt: record.capturedAt ?? null,
      failedAt: record.failedAt ?? null,
      failureReason: record.failureReason ?? null,
      metadata: record.metadata ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toTransactionRecord(record: any): PaymentTransactionRecord {
    return {
      id: record.id,
      paymentId: record.paymentId,
      provider: record.provider,
      providerEventId: record.providerEventId ?? null,
      eventType: record.eventType,
      status: record.status,
      amount: record.amount != null ? Number(record.amount) : null,
      payload: record.payload ?? null,
      processedAt: record.processedAt ?? null,
      createdAt: record.createdAt,
    };
  }

  private toWebhookRecord(record: any): PaymentWebhookRecord {
    return {
      id: record.id,
      paymentId: record.paymentId ?? null,
      provider: record.provider,
      providerEventId: record.providerEventId,
      eventType: record.eventType,
      status: record.status,
      payload: record.payload,
      receivedAt: record.receivedAt,
      processedAt: record.processedAt ?? null,
      errorMessage: record.errorMessage ?? null,
    };
  }

  private toRefundRecord(record: any): RefundRecord {
    return {
      id: record.id,
      paymentId: record.paymentId,
      bookingId: record.bookingId,
      requestedByUserId: record.requestedByUserId ?? null,
      approvedByUserId: record.approvedByUserId ?? null,
      status: record.status,
      amount: record.amount != null ? Number(record.amount) : 0,
      currency: record.currency,
      reason: record.reason ?? null,
      providerRefundId: record.providerRefundId ?? null,
      processedAt: record.processedAt ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
