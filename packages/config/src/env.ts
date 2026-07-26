import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_TOKEN_EXPIRY_SECONDS: z.coerce.number().default(900),
  JWT_REFRESH_TOKEN_EXPIRY_DAYS: z.coerce.number().default(30),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  API_PORT: z.coerce.number().default(4000),
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function loadEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missingKeys = result.error.issues
      .filter((issue) => issue.code === "invalid_type" && issue.received === "undefined")
      .map((issue) => issue.path.join("."));

    if (missingKeys.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingKeys.join(", ")}.\n` +
          "Copy .env.example to .env and fill in the values."
      );
    }

    throw new Error(`Environment validation failed: ${result.error.message}`);
  }

  _env = result.data;
  return _env;
}

export function getEnv(): Env {
  if (!_env) {
    throw new Error("Environment not loaded. Call loadEnv() during bootstrap.");
  }
  return _env;
}

export function resetEnvForTesting(): void {
  _env = null;
}