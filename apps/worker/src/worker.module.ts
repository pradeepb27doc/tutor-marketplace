import { Module } from "@nestjs/common";
import { NotificationWorkerModule } from "./notifications/notification-worker.module.js";

@Module({
  imports: [NotificationWorkerModule],
})
export class WorkerModule {}

