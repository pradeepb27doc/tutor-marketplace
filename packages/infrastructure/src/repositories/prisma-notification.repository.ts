import type {
  NotificationRepository,
  NotificationRecord,
  CreateNotificationRecord,
  ListNotificationOptions,
  NotificationTemplateRecord,
  NotificationPreferenceRecord,
  UpsertPreferenceRecord,
  DeviceRepository,
  DeviceRecord,
  UpsertDeviceRecord,
  OutboxEventRepository,
  OutboxEventRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

// Local type definition to avoid circular dependency
interface CreateOutboxEventRecord {
  eventName: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, any>;
}

type PrismaTransaction = ReturnType<typeof getPrismaClient>;

export class PrismaNotificationRepository
  implements NotificationRepository, DeviceRepository
{
  private get db(): PrismaTransaction {
    return getPrismaClient();
  }

  // --- Notification CRUD ---

  async create(data: CreateNotificationRecord): Promise<NotificationRecord> {
    const record: any = await this.db.notification.create({
      data: {
        userId: data.userId,
        channel: data.channel as any,
        provider: (data as any).provider ?? null,
        status: (data.status ?? "QUEUED") as any,
        eventName: data.eventName ?? null,
        templateId: data.templateId ?? null,
        locale: data.locale ?? "en-IN",
        title: data.title,
        body: data.body,
        data: (data.data ?? null) as any,
        recipient: data.recipient ?? null,
        idempotencyKey: data.idempotencyKey ?? null,
        correlationId: data.correlationId ?? null,
        scheduledAt: data.scheduledAt ?? null,
      },
    });
    return this.toNotificationRecord(record);
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    const record: any = await this.db.notification.findUnique({ where: { id } });
    return record ? this.toNotificationRecord(record) : null;
  }

  async findByUserId(
    userId: string,
    opts?: ListNotificationOptions,
  ): Promise<NotificationRecord[]> {
    const where: any = { userId };
    if (opts?.unreadOnly) where.readAt = null;
    const records: any[] = await this.db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: opts?.limit ?? 50,
      skip: opts?.offset ?? 0,
    });
    return records.map((r) => this.toNotificationRecord(r));
  }

  async findByUserAndId(
    userId: string,
    id: string,
  ): Promise<NotificationRecord | null> {
    const record: any = await this.db.notification.findFirst({ where: { id, userId } });
    return record ? this.toNotificationRecord(record) : null;
  }

  async markRead(id: string): Promise<NotificationRecord> {
    const record: any = await this.db.notification.update({
      where: { id },
      data: { readAt: new Date(), status: "READ" as any },
    });
    return this.toNotificationRecord(record);
  }

  async findDueForDispatch(limit: number, now: Date): Promise<NotificationRecord[]> {
    const records: any[] = await this.db.notification.findMany({
      where: {
        status: "QUEUED" as any,
        AND: [{ OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }] }],
      },
      orderBy: [{ nextAttemptAt: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }],
      take: limit,
    });
    return records.map((r) => this.toNotificationRecord(r));
  }

  async updateAfterSend(
    id: string,
    status: string,
    opts?: { sentAt?: Date | null; providerMessageId?: string | null; failureReason?: string | null },
  ): Promise<void> {
    await this.db.notification.update({
      where: { id },
      data: {
        status: status as any,
        sentAt: opts?.sentAt ?? null,
        providerMessageId: opts?.providerMessageId ?? null,
        failureReason: opts?.failureReason ?? null,
        lastError: null,
      },
    });
  }

  async incrementAttempt(id: string, nextAttemptAt: Date, errorMessage: string): Promise<void> {
    await this.db.notification.update({
      where: { id },
      data: { attempts: { increment: 1 }, nextAttemptAt, lastError: errorMessage },
    });
  }

  async markDeadLetter(id: string, errorMessage: string): Promise<void> {
    await this.db.notification.update({
      where: { id },
      data: { status: "DEAD_LETTER" as any, lastError: errorMessage, failureReason: errorMessage },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.db.notification.count({ where: { userId, readAt: null } });
  }

  // --- Templates ---

  async findTemplate(
    eventName: string,
    channel: string,
    locale: string,
  ): Promise<NotificationTemplateRecord | null> {
    const record: any = await this.db.notificationTemplate.findFirst({
      where: { eventName, channel: channel as any, locale, isActive: true },
      orderBy: { version: "desc" },
    });
    return record ? this.toTemplateRecord(record) : null;
  }

  async listTemplates(): Promise<NotificationTemplateRecord[]> {
    const records: any[] = await this.db.notificationTemplate.findMany({
      orderBy: [{ eventName: "asc" }, { channel: "asc" as any }, { version: "desc" }],
    });
    return records.map((r) => this.toTemplateRecord(r));
  }

  // --- Preferences ---

  async findPreference(
    userId: string,
    channel: string,
    category: string,
  ): Promise<NotificationPreferenceRecord | null> {
    const record: any = await this.db.notificationPreference.findUnique({
      where: { userId_channel_category: { userId, channel: channel as any, category } },
    });
    return record ? this.toPreferenceRecord(record) : null;
  }

  async upsertPreference(data: UpsertPreferenceRecord): Promise<NotificationPreferenceRecord> {
    const record: any = await this.db.notificationPreference.upsert({
      where: {
        userId_channel_category: {
          userId: data.userId,
          channel: data.channel as any,
          category: data.category,
        },
      },
      create: {
        userId: data.userId,
        channel: data.channel as any,
        category: data.category,
        enabled: data.enabled,
      },
      update: { enabled: data.enabled },
    });
    return this.toPreferenceRecord(record);
  }

  async listPreferences(userId: string): Promise<NotificationPreferenceRecord[]> {
    const records: any[] = await this.db.notificationPreference.findMany({
      where: { userId },
      orderBy: [{ category: "asc" }, { channel: "asc" as any }],
    });
    return records.map((r) => this.toPreferenceRecord(r));
  }

  // --- Device (push tokens) ---

  async upsertPushToken(data: UpsertDeviceRecord): Promise<DeviceRecord> {
    const existing: any = await this.db.device.findFirst({
      where: { userId: data.userId, platform: data.platform },
    });
    let record: any;
    if (existing) {
      record = await this.db.device.update({
        where: { id: existing.id },
        data: { pushToken: data.pushToken },
      });
    } else {
      record = await this.db.device.create({
        data: {
          userId: data.userId,
          platform: data.platform,
          pushToken: data.pushToken,
        },
      });
    }
    return this.toDeviceRecord(record);
  }

  async findPushTokensByUserId(userId: string): Promise<DeviceRecord[]> {
    const records: any[] = await this.db.device.findMany({
      where: { userId, pushToken: { not: null } },
    });
    return records.map((r) => this.toDeviceRecord(r));
  }

  // --- Mappers ---

  private toNotificationRecord(r: any): NotificationRecord {
    return {
      id: r.id,
      userId: r.userId,
      channel: r.channel,
      provider: r.provider,
      status: r.status,
      eventName: r.eventName,
      templateId: r.templateId,
      locale: r.locale,
      title: r.title,
      body: r.body,
      data: r.data,
      recipient: r.recipient,
      idempotencyKey: r.idempotencyKey,
      correlationId: r.correlationId,
      attempts: r.attempts,
      nextAttemptAt: r.nextAttemptAt,
      lastError: r.lastError,
      scheduledAt: r.scheduledAt,
      sentAt: r.sentAt,
      readAt: r.readAt,
      providerMessageId: r.providerMessageId,
      failureReason: r.failureReason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  private toTemplateRecord(r: any): NotificationTemplateRecord {
    return {
      id: r.id,
      eventName: r.eventName,
      channel: r.channel,
      locale: r.locale,
      titleTemplate: r.titleTemplate,
      bodyTemplate: r.bodyTemplate,
      variables: r.variables ?? [],
      version: r.version,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  private toPreferenceRecord(r: any): NotificationPreferenceRecord {
    return {
      id: r.id,
      userId: r.userId,
      channel: r.channel,
      category: r.category,
      enabled: r.enabled,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  private toDeviceRecord(r: any): DeviceRecord {
    return {
      id: r.id,
      userId: r.userId,
      platform: r.platform,
      pushToken: r.pushToken,
      model: r.model,
      osVersion: r.osVersion,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}

export class PrismaOutboxEventRepository
  implements OutboxEventRepository
{
  private get db(): PrismaTransaction {
    return getPrismaClient();
  }

  async create(data: CreateOutboxEventRecord): Promise<OutboxEventRecord> {
    const record: any = await this.db.outboxEvent.create({
      data: {
        eventName: data.eventName,
        aggregateType: data.aggregateType,
        aggregateId: data.aggregateId,
        payload: (data.payload ?? {}) as any,
        status: "PENDING" as any,
      },
    });
    return this.toOutboxRecord(record);
  }

  async findById(id: string): Promise<OutboxEventRecord | null> {
    const record: any = await this.db.outboxEvent.findUnique({ where: { id } });
    return record ? this.toOutboxRecord(record) : null;
  }

  async findPending(limit: number, now: Date): Promise<OutboxEventRecord[]> {
    const records: any[] = await this.db.outboxEvent.findMany({
      where: {
        status: { in: ["PENDING" as any, "PROCESSING" as any] },
        AND: [{ OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }] }],
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    return records.map((r) => this.toOutboxRecord(r));
  }

  async markProcessing(id: string): Promise<void> {
    await this.db.outboxEvent.update({
      where: { id },
      data: { status: "PROCESSING" as any, attempts: { increment: 1 }, nextAttemptAt: null },
    });
  }

  async markProcessed(id: string): Promise<void> {
    await this.db.outboxEvent.update({
      where: { id },
      data: { status: "PROCESSED" as any, processedAt: new Date() },
    });
  }

  async markFailed(id: string, errorMessage: string, nextAttemptAt: Date): Promise<void> {
    await this.db.outboxEvent.update({
      where: { id },
      data: { status: "FAILED" as any, errorMessage, nextAttemptAt, processedAt: null },
    });
  }

  private toOutboxRecord(r: any): OutboxEventRecord {
    return {
      id: r.id,
      eventName: r.eventName,
      aggregateType: r.aggregateType,
      aggregateId: r.aggregateId,
      payload: r.payload,
      status: r.status,
      attempts: r.attempts,
      nextAttemptAt: r.nextAttemptAt,
      processedAt: r.processedAt,
      errorMessage: r.errorMessage,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}