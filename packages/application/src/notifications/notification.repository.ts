// Notification module — repository interfaces and record types.
// This is an independent bounded context. Business modules publish OutboxEvent
// records only; the notification module consumes them and never reaches into
// Booking/Payment/Tutor/Verification/Auth data directly.

// --- Notification ---

export interface NotificationRecord {
  id: string;
  userId: string;
  channel: string;
  provider: string | null;
  status: string;
  eventName: string | null;
  templateId: string | null;
  locale: string;
  title: string;
  body: string;
  data: Record<string, any> | null;
  recipient: string | null;
  idempotencyKey: string | null;
  correlationId: string | null;
  attempts: number;
  nextAttemptAt: Date | null;
  lastError: string | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  readAt: Date | null;
  providerMessageId: string | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationRecord {
  userId: string;
  channel: string;
  title: string;
  body: string;
  status?: string;
  eventName?: string | null;
  templateId?: string | null;
  locale?: string;
  data?: Record<string, any> | null;
  recipient?: string | null;
  idempotencyKey?: string | null;
  correlationId?: string | null;
  scheduledAt?: Date | null;
}

export interface ListNotificationOptions {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationRepository {
  create(data: CreateNotificationRecord): Promise<NotificationRecord>;
  findById(id: string): Promise<NotificationRecord | null>;
  findByUserId(userId: string, opts?: ListNotificationOptions): Promise<NotificationRecord[]>;
  findByUserAndId(userId: string, id: string): Promise<NotificationRecord | null>;
  markRead(id: string): Promise<NotificationRecord>;
  findDueForDispatch(limit: number, now: Date): Promise<NotificationRecord[]>;
  updateAfterSend(
    id: string,
    status: string,
    opts?: { sentAt?: Date | null; providerMessageId?: string | null; failureReason?: string | null },
  ): Promise<void>;
  incrementAttempt(id: string, nextAttemptAt: Date, errorMessage: string): Promise<void>;
  markDeadLetter(id: string, errorMessage: string): Promise<void>;
  countUnread(userId: string): Promise<number>;

  // Templates
  findTemplate(
    eventName: string,
    channel: string,
    locale: string,
  ): Promise<NotificationTemplateRecord | null>;
  listTemplates(): Promise<NotificationTemplateRecord[]>;

  // Preferences
  findPreference(
    userId: string,
    channel: string,
    category: string,
  ): Promise<NotificationPreferenceRecord | null>;
  upsertPreference(data: UpsertPreferenceRecord): Promise<NotificationPreferenceRecord>;
  listPreferences(userId: string): Promise<NotificationPreferenceRecord[]>;
}

// --- Notification Template ---

export interface NotificationTemplateRecord {
  id: string;
  eventName: string;
  channel: string;
  locale: string;
  titleTemplate: string;
  bodyTemplate: string;
  variables: string[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- Notification Preference ---

export interface NotificationPreferenceRecord {
  id: string;
  userId: string;
  channel: string;
  category: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertPreferenceRecord {
  userId: string;
  channel: string;
  category: string;
  enabled: boolean;
}

// --- Device (push tokens) ---

export interface DeviceRecord {
  id: string;
  userId: string;
  platform: string;
  pushToken: string | null;
  model: string | null;
  osVersion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertDeviceRecord {
  userId: string;
  platform: string;
  pushToken: string;
}

export interface DeviceRepository {
  upsertPushToken(data: UpsertDeviceRecord): Promise<DeviceRecord>;
  findPushTokensByUserId(userId: string): Promise<DeviceRecord[]>;
}

// --- Outbox Event (consume only) ---

export interface OutboxEventRecord {
  id: string;
  eventName: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, any>;
  status: string;
  attempts: number;
  nextAttemptAt: Date | null;
  processedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Data required to publish a new OutboxEvent. */
export interface CreateOutboxEventRecord {
  eventName: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, any>;
}

export interface OutboxEventRepository {
  /** Publish a new outbox event (used by business modules). */
  create(data: CreateOutboxEventRecord): Promise<OutboxEventRecord>;
  findById(id: string): Promise<OutboxEventRecord | null>;
  findPending(limit: number, now: Date): Promise<OutboxEventRecord[]>;
  markProcessing(id: string): Promise<void>;
  markProcessed(id: string): Promise<void>;
  markFailed(id: string, errorMessage: string, nextAttemptAt: Date): Promise<void>;
}
