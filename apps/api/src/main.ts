import "reflect-metadata";
import { ValidationPipe, VersioningType, Logger } from "@nestjs/common";
import type { LogLevel } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NextFunction, Request, Response } from "express";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module.js";
import { loadEnv, getEnv } from "@tutor-marketplace/config";
import { connectPrisma, disconnectPrisma } from "@tutor-marketplace/database";
import { initializeCache, shutdownCache } from "@tutor-marketplace/infrastructure";
import { ApiHttpExceptionFilter } from "./common/http-exception.filter.js";
import { requestIdMiddleware } from "./common/request-id.middleware.js";

const DEFAULT_PORT = 4000;
const MAX_BODY_SIZE = "1mb";

function mapLogLevel(level: string): LogLevel[] {
  switch (level) {
    case "error":
      return ["error", "fatal"];
    case "warn":
      return ["error", "warn", "fatal"];
    case "info":
      return ["log", "error", "warn", "fatal"];
    case "debug":
      return ["log", "error", "warn", "debug", "fatal"];
    default:
      return ["log", "error", "warn", "debug", "fatal"];
  }
}

async function bootstrap() {
  // Load environment variables
  loadEnv();
  const env = getEnv();

  // Connect to database
  await connectPrisma();

  // Initialize Redis cache (gracefully degrades if Redis is unavailable)
  await initializeCache();

  const app = await NestFactory.create(AppModule, {
    logger: mapLogLevel(env.LOG_LEVEL),
  });

  // Security headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  // Body size limits
  app.use(json({ limit: MAX_BODY_SIZE }));
  app.use(urlencoded({ extended: true, limit: MAX_BODY_SIZE }));

  // CORS - restrict to configured origins in production
  const nodeEnv = env.NODE_ENV ?? "development";
  const allowedOrigins =
    nodeEnv === "production"
      ? (process.env.CORS_ORIGINS ?? "https://mentora.app,https://admin.mentora.app")
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean)
      : true;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "X-Session-Id"],
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.use(requestIdMiddleware);
  app.useGlobalFilters(new ApiHttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = Number(process.env.API_PORT ?? DEFAULT_PORT);
  await app.listen(port);
  Logger.log(`API listening on port ${port} (${nodeEnv})`, "Bootstrap");

  const shutdown = async (signal: string) => {
    Logger.log(`Received ${signal}, shutting down gracefully...`, "Bootstrap");
    try {
      await app.close();
    } finally {
      await shutdownCache();
      await disconnectPrisma();
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

void bootstrap();