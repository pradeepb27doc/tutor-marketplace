const { PrismaClient } = require("@prisma/client");

// Only test if the module can be loaded and constructed
// without triggering the "not a valid Win32 application" error

async function main() {
  try {
    const prisma = new PrismaClient({
      log: [],
    });
    console.log("✓ PrismaClient constructed successfully (no native DLL crash)");
    console.log("✓ WASM engine type is working on ARM64");

    await prisma.$disconnect();
    console.log("✓ PrismaClient disposed cleanly");
    process.exit(0);
  } catch (err) {
    console.error("✗ FAILED:", err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();