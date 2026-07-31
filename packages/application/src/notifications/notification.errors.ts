// Notification module custom error classes.

export class NotificationNotFoundError extends Error {
  constructor(notificationId?: string) {
    super(
      notificationId
        ? `Notification "${notificationId}" not found`
        : "Notification not found",
    );
    this.name = "NotificationNotFoundError";
  }
}

export class NotificationOwnershipError extends Error {
  constructor() {
    super("Notification does not belong to the requesting user");
    this.name = "NotificationOwnershipError";
  }
}

export class InvalidChannelError extends Error {
  constructor(channel: string) {
    super(`Invalid notification channel "${channel}"`);
    this.name = "InvalidChannelError";
  }
}

export class InvalidPreferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPreferenceError";
  }
}

export class OutboxEventProcessedError extends Error {
  constructor(eventId: string) {
    super(`Outbox event "${eventId}" is already processed`);
    this.name = "OutboxEventProcessedError";
  }
}