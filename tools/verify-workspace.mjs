import { spawnSync } from "node:child_process";

const scripts = [
  "tools/verify-structure.mjs",
  "tools/verify-prisma-schema.mjs",
  "tools/verify-api-spec.mjs"
];

for (const script of scripts) {
  const result = spawnSync(process.execPath, [script], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Workspace verification passed.");
