/**
 * Logger abstraction for structured logging.
 *
 * Provides a consistent logging interface across the application.
 * Supports optional integration with Sentry, OpenTelemetry, or any
 * structured logging backend without requiring external services.
 *
 * Usage:
 *   import { logger } from "@tutor-marketplace/application";
 *   logger.info("User logged in", { userId });
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export type LogTransport = (entry: LogEntry) => void;

const DEFAULT_TRANSPORT: LogTransport = (entry) => {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const meta = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
  const err = entry.error ? ` ${entry.error.stack ?? entry.error.message}` : "";

  switch (entry.level) {
    case "error":
      console.error(`${prefix} ${entry.message}${meta}${err}`);
      break;
    case "warn":
      console.warn(`${prefix} ${entry.message}${meta}`);
      break;
    case "debug":
      console.debug(`${prefix} ${entry.message}${meta}`);
      break;
    default:
      console.log(`${prefix} ${entry.message}${meta}`);
  }
};

class Logger {
  private transports: LogTransport[] = [DEFAULT_TRANSPORT];
  private minLevel: LogLevel = "debug";
  private levelOrder: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levelOrder[level] >= this.levelOrder[this.minLevel];
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
  }

  private emit(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;
    for (const transport of this.transports) {
      try {
        transport(entry);
      } catch {
        // Transport errors must never break the application
      }
    }
  }

  /**
   * Set the minimum log level. Messages below this level are suppressed.
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Add a custom transport (e.g. Sentry, OpenTelemetry, file).
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Remove all transports and reset to default.
   */
  resetTransports(): void {
    this.transports = [DEFAULT_TRANSPORT];
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.emit(this.createEntry("debug", message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emit(this.createEntry("info", message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emit(this.createEntry("warn", message, context));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.emit(this.createEntry("error", message, context, error));
  }
}

export const logger = new Logger();