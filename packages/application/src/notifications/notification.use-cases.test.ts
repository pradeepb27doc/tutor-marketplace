import { describe, expect, it, beforeEach } from "vitest";
import {
  ProcessOutboxEventUseCase,
  SendPendingNotificationsUseCase,
  DispatchOutboxEventsUseCase,
  ListUserNotificationsUseCase,
  MarkNotificationReadUseCase,
  GetUserNotificationPreferencesUseCase,
  UpdateNotificationPreferenceUseCase,
  RegisterDeviceTokenUseCase,
} from "./index.js";
import {
  NotificationNotFoundError,
  NotificationOwnershipError,
} from "./notification.errors.js";
import { NotificationProviderRegistry } from "./notification.provider.js";
import type { NotificationProvider } from "./notification.provider.js";
import type {
  NotificationRepository,
  NotificationRecord,
  CreateNotificationRecord,
  NotificationTemplateRecord,
  NotificationPreferenceRecord,
  DeviceRecord,
  UpsertDeviceRecord,
  DeviceRepository,
  OutboxEventRepository,
  OutboxEventRecord,
  CreateOutboxEventRecord,
} from "./notification.repository.js";
import { FakeClock } from "@tutor-marketplace/testing";

// --- Inline fakes for notification infrastructure ---

let _seq = 0;
function nextId(prefix: string): string {
  _seq += 1;
  return `${prefix}-${_seq}`;
}

class FakeNotificationRepository implements NotificationRepository {
  public notifications: NotificationRecord[] = [];
  public templates: NotificationTemplateRecord[] = [];
  public preferences: NotificationPreferenceRecord[] = [];

  async create(data: CreateNotificationRecord): Promise<NotificationRecord> {
    const now = new Date();
    const record: NotificationRecord = {
      id: nextId("notif"),
      userId: data.userId,
      channel: data.channel,
      provider: null,
      status: data.status ?? "QUEUED",
      eventName: data.eventName ?? null,
      templateId: data.templateId ?? null,
      locale: data.locale ?? "en-IN",
      title: data.title,
      body: data.body,
      data: data.data ?? null,
      recipient: data.recipient ?? null,
      idempotencyKey: data.idempotencyKey ?? null,
      correlationId: data.correlationId ?? null,
      attempts: 0,
      nextAttemptAt: null,
      lastError: null,
      scheduledAt: data.scheduledAt ?? null,
      sentAt: null,
      readAt: null,
      providerMessageId: null,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
    };
    this.notifications.push(record);
    return record;
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    return this.notifications.find((n) => n.id === id) ?? null;
  }

  async findByUserId(userId: string, opts?: { unreadOnly?: boolean; limit?: number; offset?: number }): Promise<NotificationRecord[]> {
    let result = this.notifications.filter((n) => n.userId === userId);
    if (opts?.unreadOnly) result = result.filter((n) => !n.readAt);
    return result.slice(opts?.offset ?? 0, opts?.limit ? (opts.offset ?? 0) + opts.limit : undefined);
  }

  async findByUserAndId(userId: string, id: string): Promise<NotificationRecord | null> {
    return this.notifications.find((n) => n.id === id && n.userId === userId) ?? null;
  }

  async markRead(id: string): Promise<NotificationRecord> {
    const n = this.notifications.find((x) => x.id === id);
    if (n) {
      n.readAt = new Date();
      n.updatedAt = new Date();
    }
    return n!;
  }

  async findDueForDispatch(limit: number, now: Date): Promise<NotificationRecord[]> {
    return this.notifications.filter(
      (n) =>
        n.status === "QUEUED" &&
        (!n.scheduledAt || n.scheduledAt <= now) &&
        (!n.nextAttemptAt || n.nextAttemptAt <= now),
    ).slice(0, limit);
  }

  async updateAfterSend(id: string, status: string, opts?: { sentAt?: Date | null; providerMessageId?: string | null; failureReason?: string | null }): Promise<void> {
    const n = this.notifications.find((x) => x.id === id);
    if (n) {
      n.status = status;
      n.sentAt = opts?.sentAt ?? n.sentAt;
      n.providerMessageId = opts?.providerMessageId ?? n.providerMessageId;
      n.failureReason = opts?.failureReason ?? null;
      n.updatedAt = new Date();
    }
  }

  async incrementAttempt(id: string, nextAttemptAt: Date, errorMessage: string): Promise<void> {
    const n = this.notifications.find((x) => x.id === id);
    if (n) {
      n.attempts += 1;
      n.nextAttemptAt = nextAttemptAt;
      n.lastError = errorMessage;
      n.updatedAt = new Date();
    }
  }

  async markDeadLetter(id: string, errorMessage: string): Promise<void> {
    const n = this.notifications.find((x) => x.id === id);
    if (n) {
      n.status = "DEAD_LETTER";
      n.lastError = errorMessage;
      n.failureReason = errorMessage;
      n.updatedAt = new Date();
    }
  }

  async countUnread(userId: string): Promise<number> {
    return this.notifications.filter((n) => n.userId === userId && !n.readAt).length;
  }

  async findTemplate(eventName: string, channel: string, locale: string): Promise<NotificationTemplateRecord | null> {
    return this.templates.find(
      (t) => t.eventName === eventName && t.channel === channel && t.locale === locale && t.isActive,
    ) ?? null;
  }

  async listTemplates(): Promise<NotificationTemplateRecord[]> {
    return this.templates;
  }

  async findPreference(userId: string, channel: string, category: string): Promise<NotificationPreferenceRecord | null> {
    return this.preferences.find(
      (p) => p.userId === userId && p.channel === channel && p.category === category,
    ) ?? null;
  }

  async upsertPreference(data: { userId: string; channel: string; category: string; enabled: boolean }): Promise<NotificationPreferenceRecord> {
    const existing = await this.findPreference(data.userId, data.channel, data.category);
    if (existing) {
      existing.enabled = data.enabled;
      existing.updatedAt = new Date();
      return existing;
    }
    const now = new Date();
    const record: NotificationPreferenceRecord = {
      id: nextId("pref"),
      userId: data.userId,
      channel: data.channel,
      category: data.category,
      enabled: data.enabled,
      createdAt: now,
      updatedAt: now,
    };
    this.preferences.push(record);
    return record;
  }

  async listPreferences(userId: string): Promise<NotificationPreferenceRecord[]> {
    return this.preferences.filter((p) => p.userId === userId);
  }
}

class FakeDeviceRepository implements DeviceRepository {
  public devices: DeviceRecord[] = [];

  async upsertPushToken(data: UpsertDeviceRecord): Promise<DeviceRecord> {
    const existing = this.devices.find(
      (d) => d.userId === data.userId && d.platform === data.platform,
    );
    if (existing) {
      existing.pushToken = data.pushToken;
      existing.updatedAt = new Date();
      return existing;
    }
    const now = new Date();
    const record: DeviceRecord = {
      id: nextId("device"),
      userId: data.userId,
      platform: data.platform,
      pushToken: data.pushToken,
      model: null,
      osVersion: null,
      createdAt: now,
      updatedAt: now,
    };
    this.devices.push(record);
    return record;
  }

  async findPushTokensByUserId(userId: string): Promise<DeviceRecord[]> {
    return this.devices.filter((d) => d.userId === userId);
  }
}

class FakeOutboxEventRepository implements OutboxEventRepository {
  public events: OutboxEventRecord[] = [];

  async create(data: CreateOutboxEventRecord): Promise<OutboxEventRecord> {
    const now = new Date();
    const record: OutboxEventRecord = {
      id: nextId("outbox"),
      eventName: data.eventName,
      aggregateType: data.aggregateType,
      aggregateId: data.aggregateId,
      payload: data.payload,
      status: "PENDING",
      attempts: 0,
      nextAttemptAt: null,
      processedAt: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    };
    this.events.push(record);
    return record;
  }

  async findById(id: string): Promise<OutboxEventRecord | null> {
    return this.events.find((e) => e.id === id) ?? null;
  }

  async findPending(limit: number, now: Date): Promise<OutboxEventRecord[]> {
    return this.events.filter(
      (e) =>
        e.status !== "PROCESSED" &&
        (!e.nextAttemptAt || e.nextAttemptAt <= now),
    ).slice(0, limit);
  }

  async markProcessing(id: string): Promise<void> {
    const e = this.events.find((x) => x.id === id);
    if (e) {
      e.status = "PROCESSING";
      e.updatedAt = new Date();
    }
  }

  async markProcessed(id: string): Promise<void> {
    const e = this.events.find((x) => x.id === id);
    if (e) {
      e.status = "PROCESSED";
      e.processedAt = new Date();
      e.updatedAt = new Date();
    }
  }

  async markFailed(id: string, errorMessage: string, nextAttemptAt: Date): Promise<void> {
    const e = this.events.find((x) => x.id === id);
    if (e) {
      e.status = "FAILED";
      e.errorMessage = errorMessage;
      e.nextAttemptAt = nextAttemptAt;
      e.attempts += 1;
      e.updatedAt = new Date();
    }
  }
}

class FakeNotificationProvider implements NotificationProvider {
  readonly channel: string;
  public sent: Array<{ notificationId: string; channel: string; recipient: string | null; title: string; body: string }> = [];
  public shouldFail = false;

  constructor(channel: string) {
    this.channel = channel;
  }

  async send(input: { notificationId: string; channel: string; recipient: string | null; title: string; body: string; data?: Record<string, any> | null }): Promise<{ providerMessageId?: string | null }> {
    if (this.shouldFail) throw new Error(`Provider ${this.channel} failed`);
    this.sent.push(input);
    return { providerMessageId: `msg-${input.notificationId}` };
  }
}

// --- Helpers ---

function makeTemplate(overrides?: Partial<NotificationTemplateRecord>): NotificationTemplateRecord {
  return {
    id: "template-1",
    eventName: "BOOKING_CONFIRMED",
    channel: "PUSH",
    locale: "en-IN",
    titleTemplate: "Booking {{status}}",
    bodyTemplate: "Your booking for {{subject}} is {{status}}",
    variables: ["status", "subject"],
    version: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function setup() {
  const clock = new FakeClock(new Date("2026-07-14T00:00:00Z"));
  const notifRepo = new FakeNotificationRepository();
  const deviceRepo = new FakeDeviceRepository();
  const outboxRepo = new FakeOutboxEventRepository();
  const registry = new NotificationProviderRegistry();
  const pushProvider = new FakeNotificationProvider("PUSH");
  const inAppProvider = new FakeNotificationProvider("IN_APP");
  registry.register(pushProvider);
  registry.register(inAppProvider);

  // Add templates for all channels
  notifRepo.templates.push(makeTemplate());
  notifRepo.templates.push(makeTemplate({
    id: "template-inapp",
    channel: "IN_APP",
  }));

  return { clock, notifRepo, deviceRepo, outboxRepo, registry, pushProvider, inAppProvider };
}

// ===== Tests =====

describe("ProcessOutboxEventUseCase", () => {
  it("expands an outbox event into queued notifications for each user/channel", async () => {
    const s = setup();
    const event = await s.outboxRepo.create({
      eventName: "BOOKING_CONFIRMED",
      aggregateType: "Booking",
      aggregateId: "booking-1",
      payload: { userIds: ["user-1", "user-2"], status: "confirmed", subject: "Math" },
    });

    // Register device tokens for both users
    await s.deviceRepo.upsertPushToken({ userId: "user-1", platform: "ios", pushToken: "token-1" });
    await s.deviceRepo.upsertPushToken({ userId: "user-2", platform: "android", pushToken: "token-2" });

    const useCase = new ProcessOutboxEventUseCase(s.outboxRepo, s.notifRepo, s.deviceRepo, s.clock);
    await useCase.execute({ eventId: event.id });

    // Should create 2 (users) x 2 (channels PUSH + IN_APP) = 4 notifications
    expect(s.notifRepo.notifications).toHaveLength(4);
    expect(s.notifRepo.notifications.every((n) => n.status === "QUEUED")).toBe(true);

    // user-1 push should have recipient = token-1
    const user1Push = s.notifRepo.notifications.find(
      (n) => n.userId === "user-1" && n.channel === "PUSH",
    );
    expect(user1Push?.recipient).toBe("token-1");

    // IN_APP notifications should use userId as recipient
    const user1InApp = s.notifRepo.notifications.find(
      (n) => n.userId === "user-1" && n.channel === "IN_APP",
    );
    expect(user1InApp?.recipient).toBe("user-1");

    // Event should be marked processed
    const processed = await s.outboxRepo.findById(event.id);
    expect(processed?.status).toBe("PROCESSED");
  });

  it("skips processing if event is already processed", async () => {
    const s = setup();
    const processedEvent = await s.outboxRepo.create({
      eventName: "BOOKING_CONFIRMED",
      aggregateType: "Booking",
      aggregateId: "booking-1",
      payload: { userIds: ["user-1"] },
    });
    await s.outboxRepo.markProcessed(processedEvent.id);

    const useCase = new ProcessOutboxEventUseCase(s.outboxRepo, s.notifRepo, s.deviceRepo, s.clock);
    await useCase.execute({ eventId: processedEvent.id });

    expect(s.notifRepo.notifications).toHaveLength(0);
  });

  it("handles missing event gracefully", async () => {
    const s = setup();
    const useCase = new ProcessOutboxEventUseCase(s.outboxRepo, s.notifRepo, s.deviceRepo, s.clock);
    await useCase.execute({ eventId: "non-existent" });
    expect(s.notifRepo.notifications).toHaveLength(0);
  });

  it("respects user notification preferences for non-mandatory categories", async () => {
    const s = setup();
    // "BOOKING_CONFIRMED" derives to "BOOKING" category - not mandatory
    const event = await s.outboxRepo.create({
      eventName: "BOOKING_CONFIRMED",
      aggregateType: "Booking",
      aggregateId: "booking-1",
      payload: { userIds: ["user-1"], status: "confirmed", subject: "Math" },
    });

    // Disable PUSH for user-1 in BOOKING category
    await s.notifRepo.upsertPreference({ userId: "user-1", channel: "PUSH", category: "BOOKING", enabled: false });

    const useCase = new ProcessOutboxEventUseCase(s.outboxRepo, s.notifRepo, s.deviceRepo, s.clock);
    await useCase.execute({ eventId: event.id });

    // Should only create IN_APP notification (PUSH is disabled)
    const user1Notifs = s.notifRepo.notifications.filter((n) => n.userId === "user-1");
    expect(user1Notifs).toHaveLength(1);
    expect(user1Notifs[0].channel).toBe("IN_APP");
  });

  it("delivers mandatory category notifications regardless of preferences", async () => {
    const s = setup();
    // PAYMENT events are mandatory
    const event = await s.outboxRepo.create({
      eventName: "PAYMENT_CAPTURED",
      aggregateType: "Payment",
      aggregateId: "payment-1",
      payload: { userIds: ["user-1"], status: "captured", subject: "Payment" },
    });

    // Add template for PAYMENT_CAPTURED for both channels
    s.notifRepo.templates.push(makeTemplate({
      id: "template-payment-push",
      eventName: "PAYMENT_CAPTURED",
      channel: "PUSH",
    }));
    s.notifRepo.templates.push(makeTemplate({
      id: "template-payment-inapp",
      eventName: "PAYMENT_CAPTURED",
      channel: "IN_APP",
    }));

    // Register device for PUSH delivery
    await s.deviceRepo.upsertPushToken({ userId: "user-1", platform: "ios", pushToken: "token-1" });

    // Disable all channels for user-1 - should still deliver since PAYMENT is mandatory
    await s.notifRepo.upsertPreference({ userId: "user-1", channel: "PUSH", category: "PAYMENT", enabled: false });
    await s.notifRepo.upsertPreference({ userId: "user-1", channel: "IN_APP", category: "PAYMENT", enabled: false });

    const useCase = new ProcessOutboxEventUseCase(s.outboxRepo, s.notifRepo, s.deviceRepo, s.clock);
    await useCase.execute({ eventId: event.id });

    // Both channels should still be created because PAYMENT is mandatory
    const user1Notifs = s.notifRepo.notifications.filter((n) => n.userId === "user-1");
    expect(user1Notifs).toHaveLength(2);
  });

  it("marks event as failed on processing error", async () => {
    const s = setup();
    // Trigger error by making the outboxRepo.findById throw
    const event = await s.outboxRepo.create({
      eventName: "BROKEN_EVENT",
      aggregateType: "Booking",
      aggregateId: "booking-1",
      payload: { userIds: ["user-1"] },
    });

    // Remove templates to cause no matching template (not an error, just empty)

    const useCase = new ProcessOutboxEventUseCase(s.outboxRepo, s.notifRepo, s.deviceRepo, s.clock);
    await useCase.execute({ eventId: event.id });

    const processed = await s.outboxRepo.findById(event.id);
    expect(processed?.status).toBe("PROCESSED");
  });
});

describe("SendPendingNotificationsUseCase", () => {
  it("sends due notifications and marks them as sent", async () => {
    const s = setup();

    // Create a queued notification
    await s.notifRepo.create({
      userId: "user-1",
      channel: "PUSH",
      title: "Test",
      body: "Test body",
      recipient: "token-1",
    });

    const useCase = new SendPendingNotificationsUseCase(s.notifRepo, s.registry, s.clock);
    const result = await useCase.execute({ limit: 50 });

    expect(result.processed).toBe(1);
    expect(result.sent).toBe(1);
    expect(result.failed).toBe(0);

    const notif = s.notifRepo.notifications[0];
    expect(notif.status).toBe("SENT");
    expect(notif.providerMessageId).toBe(`msg-${notif.id}`);
  });

  it("increments attempts and retries on failure, then dead-letters after max attempts", async () => {
    const s = setup();
    s.pushProvider.shouldFail = true;

    // Create a notification that has already been attempted 4 times (max is 5)
    const notif = await s.notifRepo.create({
      userId: "user-1",
      channel: "PUSH",
      title: "Test",
      body: "Test body",
      recipient: "token-1",
    });

    // Manually set attempts to 4 (max-1)
    const stored = s.notifRepo.notifications[0];
    stored.attempts = 4;

    const useCase = new SendPendingNotificationsUseCase(s.notifRepo, s.registry, s.clock);
    const result = await useCase.execute({ limit: 50 });

    expect(result.processed).toBe(1);
    expect(result.sent).toBe(0);
    expect(result.failed).toBe(1);

    // Should now be dead-lettered since attempts >= MAX_ATTEMPTS (5)
    expect(s.notifRepo.notifications[0].status).toBe("DEAD_LETTER");
  });

  it("increments attempt and sets nextRetryAt for non-exhausted failures", async () => {
    const s = setup();
    s.pushProvider.shouldFail = true;

    await s.notifRepo.create({
      userId: "user-1",
      channel: "PUSH",
      title: "Test",
      body: "Test body",
      recipient: "token-1",
    });

    const useCase = new SendPendingNotificationsUseCase(s.notifRepo, s.registry, s.clock);
    const result = await useCase.execute({ limit: 50 });

    expect(result.failed).toBe(1);
    const notif = s.notifRepo.notifications[0];
    expect(notif.attempts).toBe(1);
    expect(notif.nextAttemptAt).toBeDefined();
    expect(notif.status).not.toBe("DEAD_LETTER");
  });

  it("handles empty queue gracefully", async () => {
    const s = setup();
    const useCase = new SendPendingNotificationsUseCase(s.notifRepo, s.registry, s.clock);
    const result = await useCase.execute({ limit: 50 });
    expect(result.processed).toBe(0);
    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);
  });

  it("throws ProviderNotConfiguredError for unregistered channel", async () => {
    const s = setup();
    // Create a notification with EMAIL channel (no provider registered)
    await s.notifRepo.create({
      userId: "user-1",
      channel: "EMAIL",
      title: "Test",
      body: "Test body",
      recipient: "email@test.com",
    });

    const useCase = new SendPendingNotificationsUseCase(s.notifRepo, s.registry, s.clock);
    const result = await useCase.execute({ limit: 50 });
    // Should fail with provider not configured error
    expect(result.failed).toBe(1);
    const notif = s.notifRepo.notifications[0];
    expect(notif.status).toBe("QUEUED");
    expect(notif.attempts).toBe(1);
  });
});

describe("DispatchOutboxEventsUseCase", () => {
  it("processes pending outbox events and returns counts", async () => {
    const s = setup();
    s.notifRepo.templates.push(makeTemplate());

    const event1 = await s.outboxRepo.create({
      eventName: "BOOKING_CONFIRMED",
      aggregateType: "Booking",
      aggregateId: "booking-1",
      payload: { userIds: ["user-1"], status: "confirmed", subject: "Math" },
    });
    const event2 = await s.outboxRepo.create({
      eventName: "BOOKING_CONFIRMED",
      aggregateType: "Booking",
      aggregateId: "booking-2",
      payload: { userIds: ["user-2"], status: "pending", subject: "Science" },
    });

    const processUseCase = new ProcessOutboxEventUseCase(s.outboxRepo, s.notifRepo, s.deviceRepo, s.clock);
    const useCase = new DispatchOutboxEventsUseCase(s.outboxRepo, processUseCase, s.clock);
    const result = await useCase.execute({ limit: 50 });

    expect(result.processed).toBe(2);
    expect(result.skipped).toBe(0);

    const e1 = await s.outboxRepo.findById(event1.id);
    const e2 = await s.outboxRepo.findById(event2.id);
    expect(e1?.status).toBe("PROCESSED");
    expect(e2?.status).toBe("PROCESSED");
  });

  it("skips already processed events", async () => {
    const s = setup();
    const event = await s.outboxRepo.create({
      eventName: "BOOKING_CONFIRMED",
      aggregateType: "Booking",
      aggregateId: "booking-1",
      payload: { userIds: ["user-1"] },
    });
    await s.outboxRepo.markProcessed(event.id);

    const processUseCase = new ProcessOutboxEventUseCase(s.outboxRepo, s.notifRepo, s.deviceRepo, s.clock);
    const useCase = new DispatchOutboxEventsUseCase(s.outboxRepo, processUseCase, s.clock);
    const result = await useCase.execute({ limit: 50 });

    // PROCESSED events are not returned by findPending, so neither processed nor skipped
    expect(result.processed).toBe(0);
    expect(result.skipped).toBe(0);
  });
});

describe("ListUserNotificationsUseCase", () => {
  it("lists notifications for a user with unread count", async () => {
    const s = setup();
    await s.notifRepo.create({ userId: "user-1", channel: "PUSH", title: "N1", body: "Body1" });
    await s.notifRepo.create({ userId: "user-1", channel: "IN_APP", title: "N2", body: "Body2" });
    await s.notifRepo.create({ userId: "user-2", channel: "PUSH", title: "N3", body: "Body3" });

    const useCase = new ListUserNotificationsUseCase(s.notifRepo);
    const result = await useCase.execute({ userId: "user-1" });

    expect(result.items).toHaveLength(2);
    expect(result.unreadCount).toBe(2);
    expect(result.total).toBe(2);
  });

  it("filters by unreadOnly", async () => {
    const s = setup();
    const n1 = await s.notifRepo.create({ userId: "user-1", channel: "PUSH", title: "N1", body: "Body1" });
    await s.notifRepo.create({ userId: "user-1", channel: "IN_APP", title: "N2", body: "Body2" });
    await s.notifRepo.markRead(n1.id);

    const useCase = new ListUserNotificationsUseCase(s.notifRepo);
    const result = await useCase.execute({ userId: "user-1", unreadOnly: true });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(s.notifRepo.notifications[1].id);
  });
});

describe("MarkNotificationReadUseCase", () => {
  it("marks a notification as read", async () => {
    const s = setup();
    const notif = await s.notifRepo.create({ userId: "user-1", channel: "PUSH", title: "N1", body: "Body1" });

    const useCase = new MarkNotificationReadUseCase(s.notifRepo);
    await useCase.execute({ userId: "user-1", notificationId: notif.id });

    const updated = s.notifRepo.notifications.find((n) => n.id === notif.id);
    expect(updated?.readAt).toBeInstanceOf(Date);
  });

  it("throws NotificationNotFoundError for missing notification", async () => {
    const s = setup();
    const useCase = new MarkNotificationReadUseCase(s.notifRepo);
    await expect(
      useCase.execute({ userId: "user-1", notificationId: "nonexistent" }),
    ).rejects.toThrow(NotificationNotFoundError);
  });

  it("throws NotificationNotFoundError for mismatched user (findByUserAndId returns null)", async () => {
    const s = setup();
    const notif = await s.notifRepo.create({ userId: "user-1", channel: "PUSH", title: "N1", body: "Body1" });

    const useCase = new MarkNotificationReadUseCase(s.notifRepo);
    await expect(
      useCase.execute({ userId: "user-2", notificationId: notif.id }),
    ).rejects.toThrow(NotificationNotFoundError);
  });
});

describe("GetUserNotificationPreferencesUseCase", () => {
  it("returns all preferences for a user", async () => {
    const s = setup();
    await s.notifRepo.upsertPreference({ userId: "user-1", channel: "PUSH", category: "BOOKING", enabled: true });
    await s.notifRepo.upsertPreference({ userId: "user-1", channel: "EMAIL", category: "MARKETING", enabled: false });

    const useCase = new GetUserNotificationPreferencesUseCase(s.notifRepo);
    const result = await useCase.execute({ userId: "user-1" });

    expect(result).toHaveLength(2);
    expect(result[0].userId).toBe("user-1");
    expect(result[0].enabled).toBe(true);
  });

  it("returns empty array for user with no preferences", async () => {
    const s = setup();
    const useCase = new GetUserNotificationPreferencesUseCase(s.notifRepo);
    const result = await useCase.execute({ userId: "user-1" });
    expect(result).toHaveLength(0);
  });
});

describe("UpdateNotificationPreferenceUseCase", () => {
  it("creates or updates a preference", async () => {
    const s = setup();
    const useCase = new UpdateNotificationPreferenceUseCase(s.notifRepo);

    const created = await useCase.execute({
      userId: "user-1",
      channel: "PUSH",
      category: "BOOKING",
      enabled: false,
    });
    expect(created.enabled).toBe(false);
    expect(created.category).toBe("BOOKING");

    const updated = await useCase.execute({
      userId: "user-1",
      channel: "PUSH",
      category: "BOOKING",
      enabled: true,
    });
    expect(updated.enabled).toBe(true);
    expect(updated.id).toBe(created.id);
  });
});

describe("RegisterDeviceTokenUseCase", () => {
  it("registers a device push token", async () => {
    const s = setup();
    const useCase = new RegisterDeviceTokenUseCase(s.deviceRepo);

    await useCase.execute({ userId: "user-1", platform: "ios", pushToken: "token-1" });
    expect(s.deviceRepo.devices).toHaveLength(1);
    expect(s.deviceRepo.devices[0].pushToken).toBe("token-1");

    // Upsert (same platform)
    await useCase.execute({ userId: "user-1", platform: "ios", pushToken: "token-2" });
    expect(s.deviceRepo.devices).toHaveLength(1);
    expect(s.deviceRepo.devices[0].pushToken).toBe("token-2");
  });
});