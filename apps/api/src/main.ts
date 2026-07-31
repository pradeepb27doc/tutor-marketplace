import "reflect-metadata";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { loadEnv } from "@tutor-marketplace/config";
import { connectPrisma } from "@tutor-marketplace/database";
import { ApiHttpExceptionFilter } from "./common/http-exception.filter.js";
import { requestIdMiddleware } from "./common/request-id.middleware.js";

const DEFAULT_PORT = 4000;

async function bootstrap() {
  // Load environment variables
  loadEnv();

  // Connect to database
  await connectPrisma();

  const app = await NestFactory.create(AppModule);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.use(requestIdMiddleware);
  app.useGlobalFilters(new ApiHttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  const port = Number(process.env.API_PORT ?? DEFAULT_PORT);
  await app.listen(port);
}

void bootstrap();

