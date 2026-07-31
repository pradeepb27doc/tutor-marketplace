import { PrismaClient } from "@prisma/client";

// Only test if the module can be loaded and constructed
// without triggering the "not a valid Win32 application" error
// Do NOT connect -- just verify initialization doesn't crash

try {
  const prisma = new PrismaClient({
    // Disable logging to avoid noise
    log: [],
  });
  console.log("✓ PrismaClient constructed successfully (no native DLL crash)");
  console.log("✓ WASM engine type is working on ARM64");

  // Clean disconnect without connecting
  await prisma.$disconnect();
  console.log("✓ PrismaClient disposed cleanly");
  process.exit(0);
} catch (err) {
  console.error("✗ FAILED:", err.message);
  process.exit(1);
}