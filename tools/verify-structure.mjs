import { existsSync } from "node:fs";
import { resolve } from "node:path";

const requiredPaths = [
  "README.md",
  "package.json",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  ".env.example",
  "tools/verify-workspace.mjs",
  "tools/verify-api-spec.mjs",
  "docs/PRD.md",
  "docs/SystemArchitecture.md",
  "docs/FolderStructure.md",
  "docs/DatabaseSchema.md",
  "docs/RestApiSpecification.md",
  "apps/api/package.json",
  "apps/api/src/main.ts",
  "apps/api/src/app.module.ts",
  "apps/api/src/health/health.controller.ts",
  "apps/worker/package.json",
  "apps/worker/src/main.ts",
  "apps/worker/src/worker.module.ts",
  "apps/worker/src/health/worker-health.ts",
  "apps/mobile/package.json",
  "apps/mobile/App.tsx",
  "apps/admin/package.json",
  "apps/admin/src/app/page.tsx",
  "packages/domain/package.json",
  "packages/domain/src/index.ts",
  "packages/application/package.json",
  "packages/application/src/index.ts",
  "packages/infrastructure/package.json",
  "packages/infrastructure/src/index.ts",
  "packages/config/package.json",
  "packages/config/src/index.ts",
  "packages/database/package.json",
  "packages/database/src/index.ts",
  "packages/database/prisma/schema.prisma",
  "infra/README.md",
  "infra/docker/README.md",
  "infra/terraform/README.md"
];

const missingPaths = requiredPaths.filter((path) => !existsSync(resolve(path)));

if (missingPaths.length > 0) {
  console.error("Workspace structure verification failed.");
  for (const path of missingPaths) {
    console.error(`Missing: ${path}`);
  }
  process.exit(1);
}

console.log(`Workspace structure verification passed (${requiredPaths.length} paths).`);
