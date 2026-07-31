import { Injectable, Logger } from "@nestjs/common";
import {
  DispatchOutboxEventsUseCase,
  SendPendingNotificationsUseCase,
} from "@tutor-marketplace/application";

@Injectable()
export class NotificationWorkerService {
  private readonly logger = new Logger(NotificationWorkerService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly dispatchOutboxUseCase: DispatchOutboxEventsUseCase,
    private readonly sendPendingUseCase: SendPendingNotificationsUseCase,
  ) {}

  start(pollIntervalMs: number = 10_000): void {
    if (this.intervalHandle) return;
    this.logger.log(`Starting notification worker (poll every ${pollIntervalMs}ms)`);

    // Run immediately on start
    void this.tick();

    this.intervalHandle = setInterval(() => void this.tick(), pollIntervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private async tick(): Promise<void> {
    try {
      const dispatchResult = await this.dispatchOutboxUseCase.execute({ limit: 50 });
      if (dispatchResult.processed > 0) {
        this.logger.log(`Dispatch: processed ${dispatchResult.processed}, skipped ${dispatchResult.skipped}`);
      }

      const sendResult = await this.sendPendingUseCase.execute({ limit: 50 });
      if (sendResult.processed > 0) {
        this.logger.log(`Send: processed ${sendResult.processed}, sent ${sendResult.sent}, failed ${sendResult.failed}`);
      }
    } catch (error: any) {
      this.logger.error(`Notification worker tick failed: ${error?.message ?? "Unknown error"}`);
    }
  }
}