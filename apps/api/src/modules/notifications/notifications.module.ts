import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller.js";
import {
  ListUserNotificationsUseCase,
  MarkNotificationReadUseCase,
  GetUserNotificationPreferencesUseCase,
  UpdateNotificationPreferenceUseCase,
  RegisterDeviceTokenUseCase,
} from "@tutor-marketplace/application";
import {
  SystemClock,
  PrismaNotificationRepository,
  PrismaOutboxEventRepository,
  LoggingNotificationProvider,
} from "@tutor-marketplace/infrastructure";
import {
  NotificationProviderRegistry,
} from "@tutor-marketplace/application";

@Module({
  controllers: [NotificationsController],
  providers: [
    // NotificationProviderRegistry (with LoggingNotificationProvider registered)
    {
      provide: NotificationProviderRegistry,
      useFactory: (loggingProvider: LoggingNotificationProvider) => {
        const registry = new NotificationProviderRegistry();
        registry.register(loggingProvider);
        return registry;
      },
      inject: [LoggingNotificationProvider],
    },
    {
      provide: LoggingNotificationProvider,
      useClass: LoggingNotificationProvider,
    },
    {
      provide: ListUserNotificationsUseCase,
      useFactory: (repo: any) => new ListUserNotificationsUseCase(repo),
      inject: ["NotificationRepository"],
    },
    {
      provide: MarkNotificationReadUseCase,
      useFactory: (repo: any) => new MarkNotificationReadUseCase(repo),
      inject: ["NotificationRepository"],
    },
    {
      provide: GetUserNotificationPreferencesUseCase,
      useFactory: (repo: any) => new GetUserNotificationPreferencesUseCase(repo),
      inject: ["NotificationRepository"],
    },
    {
      provide: UpdateNotificationPreferenceUseCase,
      useFactory: (repo: any) => new UpdateNotificationPreferenceUseCase(repo),
      inject: ["NotificationRepository"],
    },
    {
      provide: RegisterDeviceTokenUseCase,
      useFactory: (repo: any) => new RegisterDeviceTokenUseCase(repo),
      inject: ["DeviceRepository"],
    },
    {
      provide: "NotificationRepository",
      useClass: PrismaNotificationRepository,
    },
    {
      provide: "DeviceRepository",
      useClass: PrismaNotificationRepository,
    },
    {
      provide: "NotificationProviderRegistry",
      useExisting: NotificationProviderRegistry,
    },
    {
      provide: "Clock",
      useClass: SystemClock,
    },
  ],
})
export class NotificationsModule {}
