import { createHealthPayload } from "@tutor-marketplace/config";

export function createWorkerHealthCheck() {
  return createHealthPayload("worker");
}

