import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { loadEnv } from "@tutor-marketplace/config";
import { connectPrisma, disconnectPrisma } from "@tutor-marketplace/database";
import { createWorkerHealthCheck } from "./health/worker-health.js";
import { WorkerModule } from "./worker.module.js";

async function bootstrap() {
  loadEnv();

  // Connect to database
  await connectPrisma();

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ["log", "error", "warn", "debug"],
  });

  app.enableShutdownHooks();
  Logger.log(createWorkerHealthCheck(), "Worker");

  const shutdown = async (signal: string) => {
    Logger.log(`Received ${signal}, shutting down gracefully...`, "Worker");
    try {
      await app.close();
    } finally {
      await disconnectPrisma();
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

void bootstrap();