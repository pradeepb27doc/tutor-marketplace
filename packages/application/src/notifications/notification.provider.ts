// Notification provider abstraction (port) and registry.
// Concrete providers (FCM, email, SMS) implement NotificationProvider.
// The default implementation in infrastructure is a logging provider so the
// module is fully functional without external credentials.

export interface NotificationSendInput {
  notificationId: string;
  channel: string;
  recipient: string | null;
  title: string;
  body: string;
  data?: Record<string, any> | null;
}

export interface NotificationSendResult {
  providerMessageId?: string | null;
}

export interface NotificationProvider {
  /** The channel this provider handles, e.g. "PUSH", "EMAIL", "IN_APP". */
  readonly channel: string;
  send(input: NotificationSendInput): Promise<NotificationSendResult>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(channel: string) {
    super(`No notification provider configured for channel "${channel}"`);
    this.name = "ProviderNotConfiguredError";
  }
}

export class NotificationProviderRegistry {
  private readonly providers = new Map<string, NotificationProvider>();

  register(provider: NotificationProvider): void {
    this.providers.set(provider.channel, provider);
  }

  get(channel: string): NotificationProvider {
    const provider = this.providers.get(channel);
    if (!provider) throw new ProviderNotConfiguredError(channel);
    return provider;
  }

  has(channel: string): boolean {
    return this.providers.has(channel);
  }
}