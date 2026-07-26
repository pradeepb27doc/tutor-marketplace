import { resetEnvForTesting, loadEnv } from "@tutor-marketplace/config";
import { resetPrismaForTesting } from "@tutor-marketplace/database";

/**
 * Global test setup — runs once before all test suites in each workspace project.
 * Use via vitest setupFiles configuration.
 */
export async function setupTestEnvironment(): Promise<void> {
  // Reset singleton state to ensure clean test isolation
  resetEnvForTesting();
  resetPrismaForTesting();

  // Set default test environment variables
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/tutor_marketplace_test?schema=public";
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-key-min-length-sixteen";
  process.env.JWT_ACCESS_TOKEN_EXPIRY_SECONDS = process.env.JWT_ACCESS_TOKEN_EXPIRY_SECONDS ?? "900";
  process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS = process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS ?? "30";
  process.env.NODE_ENV = "development";
  process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? "warn";

  // Load environment variables for the config package
  loadEnv();
}

/**
 * Global test teardown — runs once after all test suites in each workspace project.
 */
export async function teardownTestEnvironment(): Promise<void> {
  resetEnvForTesting();
  resetPrismaForTesting();
  delete process.env.DATABASE_URL;
}

await setupTestEnvironment();