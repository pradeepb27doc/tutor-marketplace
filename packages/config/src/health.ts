export type RuntimeName = "api" | "worker" | "admin" | "mobile";

export interface HealthPayload {
  status: "ok";
  service: RuntimeName;
  checkedAt: string;
}

export function createHealthPayload(service: RuntimeName): HealthPayload {
  return {
    status: "ok",
    service,
    checkedAt: new Date().toISOString(),
  };
}