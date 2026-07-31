// Notification module DTOs and mapper functions.

import type {
  NotificationRecord,
  NotificationPreferenceRecord,
} from "./notification.repository.js";

export interface NotificationDto {
  id: string;
  userId: string;
  channel: string;
  status: string;
  eventName: string | null;
  title: string;
  body: string;
  data: Record<string, any> | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationPreferenceDto {
  id: string;
  userId: string;
  channel: string;
  category: string;
  enabled: boolean;
}

export interface ListUserNotificationsInput {
  userId: string;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export interface ListUserNotificationsResult {
  items: NotificationDto[];
  unreadCount: number;
  total: number;
}

export interface MarkNotificationReadInput {
  userId: string;
  notificationId: string;
}

export interface GetPreferencesInput {
  userId: string;
}

export interface UpdatePreferenceInput {
  userId: string;
  channel: string;
  category: string;
  enabled: boolean;
}

export interface RegisterDeviceInput {
  userId: string;
  platform: string;
  pushToken: string;
}

export interface ProcessOutboxEventInput {
  eventId: string;
}

export interface SendDueNotificationsInput {
  limit?: number;
}

export interface SendDueNotificationsResult {
  processed: number;
  sent: number;
  failed: number;
}

export interface DispatchOutboxInput {
  limit?: number;
}

export interface DispatchOutboxResult {
  processed: number;
  skipped: number;
}

export function toNotificationDto(record: NotificationRecord): NotificationDto {
  return {
    id: record.id,
    userId: record.userId,
    channel: record.channel,
    status: record.status,
    eventName: record.eventName,
    title: record.title,
    body: record.body,
    data: record.data,
    readAt: record.readAt,
    createdAt: record.createdAt,
  };
}

export function toPreferenceDto(
  record: NotificationPreferenceRecord,
): NotificationPreferenceDto {
  return {
    id: record.id,
    userId: record.userId,
    channel: record.channel,
    category: record.category,
    enabled: record.enabled,
  };
}