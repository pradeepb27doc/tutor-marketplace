const { PrismaClient } = require("@prisma/client");

async function main() {
  try {
    const prisma = new PrismaClient({ log: [] });
    console.log("PASS: PrismaClient constructed - no DLL crash");
    await prisma.$disconnect();
    console.log("PASS: disconnect");
    process.exit(0);
  } catch (err) {
    console.error("FAIL:", err.message);
    process.exit(1);
  }
}
main();