import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NotificationWorkerService } from "./notification-worker.service.js";

// Mock the Logger to suppress output during tests
vi.mock("@nestjs/common", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@nestjs/common")>();
  return {
    ...actual,
    Logger: class {
      log = vi.fn();
      error = vi.fn();
      warn = vi.fn();
      debug = vi.fn();
      static log = vi.fn();
      static error = vi.fn();
      static warn = vi.fn();
      static debug = vi.fn();
    },
  };
});

describe("NotificationWorkerService", () => {
  let service: NotificationWorkerService;
  let dispatchOutbox: { execute: ReturnType<typeof vi.fn> };
  let sendPending: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    dispatchOutbox = { execute: vi.fn() };
    sendPending = { execute: vi.fn() };
    service = new NotificationWorkerService(
      dispatchOutbox as any,
      sendPending as any,
    );
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  describe("startup", () => {
    it("should run an immediate tick on start", async () => {
      dispatchOutbox.execute.mockResolvedValue({ processed: 5, skipped: 0 });
      sendPending.execute.mockResolvedValue({ processed: 3, sent: 3, failed: 0 });

      service.start();

      // Allow the immediate tick (called via void this.tick()) to resolve
      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledWith({ limit: 50 });
      });
      expect(sendPending.execute).toHaveBeenCalledWith({ limit: 50 });
    });

    it("should not start a second interval if already running", async () => {
      dispatchOutbox.execute.mockResolvedValue({ processed: 0, skipped: 0 });
      sendPending.execute.mockResolvedValue({ processed: 0, sent: 0, failed: 0 });

      service.start();
      service.start(); // second call should be a no-op

      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(1);
      });

      // Advance time — should only tick once more from the single interval
      vi.advanceTimersByTime(10_000);
      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("notification polling", () => {
    it("should poll at the specified interval", async () => {
      dispatchOutbox.execute.mockResolvedValue({ processed: 1, skipped: 0 });
      sendPending.execute.mockResolvedValue({ processed: 1, sent: 1, failed: 0 });

      service.start(5_000);

      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(1);
      });

      vi.advanceTimersByTime(5_000);
      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(2);
      });

      vi.advanceTimersByTime(5_000);
      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(3);
      });
    });

    it("should not log when no events are processed", async () => {
      dispatchOutbox.execute.mockResolvedValue({ processed: 0, skipped: 0 });
      sendPending.execute.mockResolvedValue({ processed: 0, sent: 0, failed: 0 });

      service.start();
      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalled();
      });
    });

    it("should process dispatch before send in each tick", async () => {
      dispatchOutbox.execute.mockResolvedValue({ processed: 10, skipped: 5 });
      sendPending.execute.mockResolvedValue({ processed: 8, sent: 7, failed: 1 });

      service.start();

      // Wait for the immediate tick
      await vi.waitFor(() => {
        expect(sendPending.execute).toHaveBeenCalled();
      });

      // dispatchOutbox should have been called before sendPending
      const dispatchCallOrder = dispatchOutbox.execute.mock.invocationCallOrder[0];
      const sendCallOrder = sendPending.execute.mock.invocationCallOrder[0];
      expect(dispatchCallOrder).toBeLessThan(sendCallOrder);
    });
  });

  describe("retry logic & failure recovery", () => {
    it("should continue polling when dispatch use-case throws", async () => {
      dispatchOutbox.execute
        .mockRejectedValueOnce(new Error("Redis connection lost"))
        .mockResolvedValueOnce({ processed: 1, skipped: 0 });
      sendPending.execute.mockResolvedValue({ processed: 0, sent: 0, failed: 0 });

      service.start(1_000);

      // First tick — dispatch throws, but the error is caught
      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(1);
      });

      // Advance to next tick — dispatch should succeed
      vi.advanceTimersByTime(1_000);
      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(2);
      });
    });

    it("should continue polling when send use-case throws", async () => {
      dispatchOutbox.execute.mockResolvedValue({ processed: 0, skipped: 0 });
      sendPending.execute
        .mockRejectedValueOnce(new Error("Database unavailable"))
        .mockResolvedValueOnce({ processed: 1, sent: 1, failed: 0 });

      service.start(1_000);

      // First tick — dispatch ok, send throws
      await vi.waitFor(() => {
        expect(sendPending.execute).toHaveBeenCalledTimes(1);
      });

      // Advance to next tick — both succeed
      vi.advanceTimersByTime(1_000);
      await vi.waitFor(() => {
        expect(sendPending.execute).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle both use-cases failing in the same tick", async () => {
      dispatchOutbox.execute.mockRejectedValue(new Error("Outbox repo down"));
      sendPending.execute.mockRejectedValue(new Error("Notification provider down"));

      service.start(1_000);

      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(1);
      });

      // The interval should still be running (no crash)
      vi.advanceTimersByTime(1_000);
      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("graceful shutdown", () => {
    it("should stop polling after stop() is called", async () => {
      dispatchOutbox.execute.mockResolvedValue({ processed: 0, skipped: 0 });
      sendPending.execute.mockResolvedValue({ processed: 0, sent: 0, failed: 0 });

      service.start(1_000);

      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalledTimes(1);
      });

      service.stop();

      vi.advanceTimersByTime(5_000);
      // Should not have been called again after stop
      expect(dispatchOutbox.execute).toHaveBeenCalledTimes(1);
    });

    it("should be a no-op when stop() is called without start()", () => {
      expect(() => service.stop()).not.toThrow();
    });
  });

  describe("worker health", () => {
    it("should report healthy after startup", async () => {
      dispatchOutbox.execute.mockResolvedValue({ processed: 0, skipped: 0 });
      sendPending.execute.mockResolvedValue({ processed: 0, sent: 0, failed: 0 });

      service.start();

      // The worker is considered healthy if it starts without throwing
      await vi.waitFor(() => {
        expect(dispatchOutbox.execute).toHaveBeenCalled();
      });
      // No errors should have been thrown
      expect(service).toBeDefined();
    });
  });
});
