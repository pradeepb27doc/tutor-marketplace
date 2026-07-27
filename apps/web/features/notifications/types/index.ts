export interface NotificationDto {
  id: string;
  userId: string;
  channel: string;
  status: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  scheduledAt?: string | null;
  sentAt?: string | null;
  readAt?: string | null;
  providerMessageId?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: string | null;
  eventName?: string | null;
  templateId?: string | null;
  locale?: string | null;
  recipient?: string | null;
  idempotencyKey?: string | null;
  correlationId?: string | null;
  attempts?: number | null;
  nextAttemptAt?: string | null;
  lastError?: string | null;
}

export interface NotificationPreferencesResponse {
  preferences: Array<{
    id: string;
    channel: string;
    category: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface UpdatePreferenceResponse {
  preference: NotificationPreferencesResponse["preferences"][number];
}

export interface NotificationQuery {
  limit?: number;
  offset?: number;
  cursor?: string | null;
  unreadOnly?: boolean;
}

export interface CursorPage {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface NotificationsListResponse {
  data: NotificationDto[];
  page: CursorPage;
}

export interface MarkReadResponse {
  marked: boolean;
}

export const DEFAULT_NOTIFICATIONS_LIMIT = 20;