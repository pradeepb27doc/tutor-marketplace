import { Module, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import {
  ProcessOutboxEventUseCase,
  SendPendingNotificationsUseCase,
  DispatchOutboxEventsUseCase,
  NotificationProviderRegistry,
} from "@tutor-marketplace/application";
import {
  PrismaNotificationRepository,
  PrismaOutboxEventRepository,
  SystemClock,
  LoggingNotificationProvider,
} from "@tutor-marketplace/infrastructure";
import { NotificationWorkerService } from "./notification-worker.service.js";

@Module({
  providers: [
    // --- Core use cases ---
    {
      provide: ProcessOutboxEventUseCase,
      useFactory: (
        outboxRepo: any,
        notificationRepo: any,
        deviceRepo: any,
        clock: any,
      ) => new ProcessOutboxEventUseCase(outboxRepo, notificationRepo, deviceRepo, clock),
      inject: [
        "OutboxEventRepository",
        "NotificationRepository",
        "DeviceRepository",
        "Clock",
      ],
    },
    {
      provide: SendPendingNotificationsUseCase,
      useFactory: (
        notificationRepo: any,
        providerRegistry: any,
        clock: any,
      ) => new SendPendingNotificationsUseCase(notificationRepo, providerRegistry, clock),
      inject: [
        "NotificationRepository",
        NotificationProviderRegistry,
        "Clock",
      ],
    },
    {
      provide: DispatchOutboxEventsUseCase,
      useFactory: (
        outboxRepo: any,
        processUseCase: ProcessOutboxEventUseCase,
        clock: any,
      ) => new DispatchOutboxEventsUseCase(outboxRepo, processUseCase, clock),
      inject: [
        "OutboxEventRepository",
        ProcessOutboxEventUseCase,
        "Clock",
      ],
    },

    // --- Provider Registry ---
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

    // --- Repositories ---
    {
      provide: "NotificationRepository",
      useClass: PrismaNotificationRepository,
    },
    {
      provide: "DeviceRepository",
      useClass: PrismaNotificationRepository,
    },
    {
      provide: "OutboxEventRepository",
      useClass: PrismaOutboxEventRepository,
    },
    {
      provide: "Clock",
      useClass: SystemClock,
    },

    // --- Worker service (auto-starts on init) ---
    NotificationWorkerService,
  ],
})
export class NotificationWorkerModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly worker: NotificationWorkerService) {}

  onModuleInit(): void {
    this.worker.start();
  }

  onModuleDestroy(): void {
    this.worker.stop();
  }
}