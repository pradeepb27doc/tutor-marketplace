import type { UseCase, Clock } from "../index.js";
import type {
  NotificationRepository,
  DeviceRepository,
  OutboxEventRepository,
  OutboxEventRecord,
} from "./notification.repository.js";
import type {
  NotificationProviderRegistry,
} from "./notification.provider.js";
import type {
  ListUserNotificationsInput,
  ListUserNotificationsResult,
  MarkNotificationReadInput,
  GetPreferencesInput,
  UpdatePreferenceInput,
  RegisterDeviceInput,
  ProcessOutboxEventInput,
  SendDueNotificationsInput,
  SendDueNotificationsResult,
  DispatchOutboxInput,
  DispatchOutboxResult,
} from "./notification.dtos.js";
import { toNotificationDto, toPreferenceDto } from "./notification.dtos.js";
import {
  NotificationNotFoundError,
  NotificationOwnershipError,
} from "./notification.errors.js";
import {
  deriveCategory,
  isMandatoryCategory,
  renderTemplate,
  DEFAULT_DISPATCH_CHANNELS,
} from "./notification.rules.js";

const MAX_ATTEMPTS = 5;
const RETRY_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes

// --- 1. Process Outbox Event (consumer) ---

export class ProcessOutboxEventUseCase
  implements UseCase<ProcessOutboxEventInput, void>
{
  constructor(
    private readonly outboxRepo: OutboxEventRepository,
    private readonly notificationRepo: NotificationRepository,
    private readonly deviceRepo: DeviceRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: ProcessOutboxEventInput): Promise<void> {
    const event = await this.outboxRepo.findById(input.eventId);
    if (!event) return;
    if (event.status === "PROCESSED") return;

    await this.outboxRepo.markProcessing(event.id);

    try {
      await this.expand(event);
      await this.outboxRepo.markProcessed(event.id);
    } catch (error: any) {
      const nextAttemptAt = new Date(this.clock.now().getTime() + RETRY_BACKOFF_MS);
      await this.outboxRepo.markFailed(
        event.id,
        error?.message ?? "Unknown error processing outbox event",
        nextAttemptAt,
      );
    }
  }

  private async expand(event: OutboxEventRecord): Promise<void> {
    const payload = event.payload ?? {};
    const recipients: string[] =
      payload.userIds && Array.isArray(payload.userIds) && payload.userIds.length > 0
        ? payload.userIds
        : payload.userId
          ? [payload.userId]
          : payload.recipientId
            ? [payload.recipientId]
            : [];

    if (recipients.length === 0) {
      // Nothing to deliver; treat as successfully processed.
      return;
    }

    const category = deriveCategory(event.eventName);
    const mandatory = isMandatoryCategory(category);
    const channels = DEFAULT_DISPATCH_CHANNELS;
    const locale = typeof payload.locale === "string" ? payload.locale : "en-IN";

    for (const userId of recipients) {
      for (const channel of channels) {
        const template = await this.notificationRepo.findTemplate(
          event.eventName,
          channel,
          locale,
        );
        if (!template || !template.isActive) continue;

        // Preference check (mandatory categories always delivered).
        if (!mandatory) {
          const pref = await this.notificationRepo.findPreference(userId, channel, category);
          if (pref && !pref.enabled) continue;
        }

        const title = renderTemplate(template.titleTemplate, payload);
        const body = renderTemplate(template.bodyTemplate, payload);

        let recipient: string | null = null;
        if (channel === "PUSH") {
          const devices = await this.deviceRepo.findPushTokensByUserId(userId);
          const withToken = devices.find((d) => d.pushToken);
          recipient = withToken?.pushToken ?? null;
          if (!recipient) continue; // No device to push to.
        } else if (channel === "IN_APP") {
          recipient = userId;
        } else if (typeof payload.recipient === "string") {
          recipient = payload.recipient;
        } else {
          continue;
        }

        await this.notificationRepo.create({
          userId,
          channel,
          title,
          body,
          status: "QUEUED",
          eventName: event.eventName,
          templateId: template.id,
          locale,
          data: payload,
          recipient,
          idempotencyKey: `${event.id}:${channel}:${userId}`,
          correlationId: event.aggregateId,
        });
      }
    }
  }
}

// --- 2. Send Due Notifications (dispatcher) ---

export class SendPendingNotificationsUseCase
  implements UseCase<SendDueNotificationsInput, SendDueNotificationsResult>
{
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly providerRegistry: NotificationProviderRegistry,
    private readonly clock: Clock,
  ) {}

  async execute(input: SendDueNotificationsInput): Promise<SendDueNotificationsResult> {
    const limit = input.limit ?? 50;
    const now = this.clock.now();
    const due = await this.notificationRepo.findDueForDispatch(limit, now);

    let sent = 0;
    let failed = 0;

    for (const notification of due) {
      try {
        const provider = this.providerRegistry.get(notification.channel);
        const result = await provider.send({
          notificationId: notification.id,
          channel: notification.channel,
          recipient: notification.recipient,
          title: notification.title,
          body: notification.body,
          data: notification.data,
        });
        await this.notificationRepo.updateAfterSend(notification.id, "SENT", {
          sentAt: now,
          providerMessageId: result.providerMessageId ?? null,
        });
        sent += 1;
      } catch (error: any) {
        failed += 1;
        const attempts = notification.attempts + 1;
        if (attempts >= MAX_ATTEMPTS) {
          await this.notificationRepo.markDeadLetter(
            notification.id,
            error?.message ?? "Send failed",
          );
        } else {
          const nextAttemptAt = new Date(now.getTime() + RETRY_BACKOFF_MS * attempts);
          await this.notificationRepo.incrementAttempt(
            notification.id,
            nextAttemptAt,
            error?.message ?? "Send failed",
          );
        }
      }
    }

    return { processed: due.length, sent, failed };
  }
}

// --- 3. Dispatch Outbox (worker orchestration) ---

export class DispatchOutboxEventsUseCase
  implements UseCase<DispatchOutboxInput, DispatchOutboxResult>
{
  constructor(
    private readonly outboxRepo: OutboxEventRepository,
    private readonly processUseCase: ProcessOutboxEventUseCase,
    private readonly clock: Clock,
  ) {}

  async execute(input: DispatchOutboxInput): Promise<DispatchOutboxResult> {
    const limit = input.limit ?? 50;
    const now = this.clock.now();
    const pending = await this.outboxRepo.findPending(limit, now);

    let processed = 0;
    let skipped = 0;

    for (const event of pending) {
      if (event.status === "PROCESSED") {
        skipped += 1;
        continue;
      }
      await this.processUseCase.execute({ eventId: event.id });
      processed += 1;
    }

    return { processed, skipped };
  }
}

// --- 4. List User Notifications ---

export class ListUserNotificationsUseCase
  implements UseCase<ListUserNotificationsInput, ListUserNotificationsResult>
{
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(input: ListUserNotificationsInput): Promise<ListUserNotificationsResult> {
    const items = await this.notificationRepo.findByUserId(input.userId, {
      limit: input.limit,
      offset: input.offset,
      unreadOnly: input.unreadOnly,
    });
    const unreadCount = await this.notificationRepo.countUnread(input.userId);
    return {
      items: items.map(toNotificationDto),
      unreadCount,
      total: unreadCount,
    };
  }
}

// --- 5. Mark Notification Read ---

export class MarkNotificationReadUseCase
  implements UseCase<MarkNotificationReadInput, void>
{
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(input: MarkNotificationReadInput): Promise<void> {
    const existing = await this.notificationRepo.findByUserAndId(
      input.userId,
      input.notificationId,
    );
    if (!existing) throw new NotificationNotFoundError(input.notificationId);
    if (existing.userId !== input.userId) throw new NotificationOwnershipError();
    await this.notificationRepo.markRead(input.notificationId);
  }
}

// --- 6. Get Notification Preferences ---

export class GetUserNotificationPreferencesUseCase
  implements UseCase<GetPreferencesInput, ReturnType<typeof toPreferenceDto>[]>
{
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(input: GetPreferencesInput) {
    const prefs = await this.notificationRepo.listPreferences(input.userId);
    return prefs.map(toPreferenceDto);
  }
}

// --- 7. Update Notification Preference ---

export class UpdateNotificationPreferenceUseCase
  implements UseCase<UpdatePreferenceInput, ReturnType<typeof toPreferenceDto>>
{
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(input: UpdatePreferenceInput) {
    const pref = await this.notificationRepo.upsertPreference({
      userId: input.userId,
      channel: input.channel,
      category: input.category,
      enabled: input.enabled,
    });
    return toPreferenceDto(pref);
  }
}

// --- 8. Register Device Token ---

export class RegisterDeviceTokenUseCase
  implements UseCase<RegisterDeviceInput, void>
{
  constructor(private readonly deviceRepo: DeviceRepository) {}

  async execute(input: RegisterDeviceInput): Promise<void> {
    await this.deviceRepo.upsertPushToken({
      userId: input.userId,
      platform: input.platform,
      pushToken: input.pushToken,
    });
  }
}