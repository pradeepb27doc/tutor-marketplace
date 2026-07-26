import type {
  NotificationProvider,
  NotificationSendInput,
  NotificationSendResult,
} from "@tutor-marketplace/application";

/**
 * Default notification provider used when no external push/email provider is
 * configured. It logs the intended delivery instead of actually sending, so
 * the notification pipeline is fully functional in local/dev environments.
 * Swap this out for FCM/SES/etc. by implementing NotificationProvider and
 * registering it in the NotificationProviderRegistry.
 */
export class LoggingNotificationProvider implements NotificationProvider {
  readonly channel: string;

  constructor(channel: string = "LOGGING") {
    this.channel = channel;
  }

  async send(input: NotificationSendInput): Promise<NotificationSendResult> {
    // eslint-disable-next-line no-console
    console.log(
      `[notification:${this.channel}] -> ${input.recipient ?? "(no recipient)"} | ${input.title}: ${input.body}`,
    );
    return {
      providerMessageId: `log_${input.notificationId}`,
    };
  }
}