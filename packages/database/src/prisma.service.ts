import { PrismaClient } from "@prisma/client";

let _prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      log:
        process.env.LOG_LEVEL === "debug"
          ? ["query", "info", "warn", "error"]
          : ["warn", "error"],
    });
  }
  return _prisma;
}

export async function connectPrisma(): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.$connect();
}

export async function disconnectPrisma(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = null;
  }
}

export function resetPrismaForTesting(): void {
  _prisma = null;
}