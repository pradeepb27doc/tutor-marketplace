export {
  ProcessOutboxEventUseCase,
  SendPendingNotificationsUseCase,
  DispatchOutboxEventsUseCase,
  ListUserNotificationsUseCase,
  MarkNotificationReadUseCase,
  GetUserNotificationPreferencesUseCase,
  UpdateNotificationPreferenceUseCase,
  RegisterDeviceTokenUseCase,
} from "./notification.use-cases.js";

export {
  NotificationProviderRegistry,
  ProviderNotConfiguredError,
} from "./notification.provider.js";
export type {
  NotificationProvider,
  NotificationSendInput,
  NotificationSendResult,
} from "./notification.provider.js";

export {
  NotificationNotFoundError,
  NotificationOwnershipError,
  InvalidChannelError,
  InvalidPreferenceError,
  OutboxEventProcessedError,
} from "./notification.errors.js";

export {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CATEGORIES,
  MANDATORY_CATEGORIES,
  DEFAULT_DISPATCH_CHANNELS,
  deriveCategory,
  isMandatoryCategory,
  renderTemplate,
} from "./notification.rules.js";
export type {
  NotificationChannelValue,
  NotificationCategoryValue,
} from "./notification.rules.js";

export type {
  NotificationRecord,
  CreateNotificationRecord,
  ListNotificationOptions,
  NotificationRepository,
  NotificationTemplateRecord,
  NotificationPreferenceRecord,
  UpsertPreferenceRecord,
  DeviceRecord,
  UpsertDeviceRecord,
  DeviceRepository,
  OutboxEventRecord,
  OutboxEventRepository,
  CreateOutboxEventRecord,
} from "./notification.repository.js";

export type {
  NotificationDto,
  NotificationPreferenceDto,
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