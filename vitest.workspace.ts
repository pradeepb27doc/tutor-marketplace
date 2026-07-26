import { defineWorkspace } from "vitest/config";
import { resolve } from "node:path";

const sharedSetupFile = resolve("packages/testing/src/setup.ts");
const sharedTestingPackage = resolve("packages/testing/src/index.ts");

const sharedResolve = {
  alias: {
    "@tutor-marketplace/testing": sharedTestingPackage,
  },
};

export default defineWorkspace([
  {
    resolve: sharedResolve,
    test: {
      name: "domain",
      root: "packages/domain",
      include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
      environment: "node",
      globals: true,
      restoreMocks: true,
    },
  },
  {
    resolve: sharedResolve,
    test: {
      name: "config",
      root: "packages/config",
      include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
      environment: "node",
      globals: true,
      restoreMocks: true,
    },
  },
  {
    resolve: sharedResolve,
    test: {
      name: "application",
      root: "packages/application",
      include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
      environment: "node",
      globals: true,
      restoreMocks: true,
      setupFiles: [sharedSetupFile],
    },
  },
  {
    resolve: sharedResolve,
    test: {
      name: "infrastructure",
      root: "packages/infrastructure",
      include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
      environment: "node",
      globals: true,
      restoreMocks: true,
      setupFiles: [sharedSetupFile],
    },
  },
  {
    resolve: sharedResolve,
    test: {
      name: "database",
      root: "packages/database",
      include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
      environment: "node",
      globals: true,
      restoreMocks: true,
      setupFiles: [sharedSetupFile],
    },
  },
  {
    test: {
      name: "api",
      root: "apps/api",
      include: ["src/**/*.test.ts", "src/**/*.spec.ts", "test/**/*.test.ts", "test/**/*.spec.ts"],
      environment: "node",
      globals: true,
      restoreMocks: true,
      setupFiles: [sharedSetupFile],
    },
  },
  {
    test: {
      name: "worker",
      root: "apps/worker",
      include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
      environment: "node",
      globals: true,
      restoreMocks: true,
      setupFiles: [sharedSetupFile],
    },
  },
]);