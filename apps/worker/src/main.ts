import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { createWorkerHealthCheck } from "./health/worker-health.js";
import { WorkerModule } from "./worker.module.js";

async function bootstrap() {
  await NestFactory.createApplicationContext(WorkerModule);
  Logger.log(createWorkerHealthCheck(), "Worker");
}

void bootstrap();

