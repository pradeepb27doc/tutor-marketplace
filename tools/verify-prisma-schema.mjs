import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const schema = readFileSync(resolve("packages/database/prisma/schema.prisma"), "utf8");

const requiredModels = [
  "User",
  "Parent",
  "Student",
  "Tutor",
  "Institute",
  "Subject",
  "TutorAvailabilitySlot",
  "Booking",
  "Payment",
  "Wallet",
  "LedgerEntry",
  "Review",
  "Attendance",
  "Homework",
  "Assignment",
  "Message",
  "Notification",
  "Coupon",
  "Referral",
  "AnalyticsEvent",
  "AuditLog",
  "OutboxEvent",
  "AiRun"
];

const requiredEnums = [
  "UserRole",
  "UserStatus",
  "TutorStatus",
  "VerificationStatus",
  "BookingStatus",
  "PaymentStatus",
  "AttendanceStatus",
  "OutboxStatus"
];

const missingModels = requiredModels.filter((name) => !new RegExp(`model\\s+${name}\\s+{`).test(schema));
const missingEnums = requiredEnums.filter((name) => !new RegExp(`enum\\s+${name}\\s+{`).test(schema));

let balance = 0;
for (const char of schema) {
  if (char === "{") balance += 1;
  if (char === "}") balance -= 1;
  if (balance < 0) break;
}

if (missingModels.length > 0 || missingEnums.length > 0 || balance !== 0) {
  console.error("Prisma schema structural verification failed.");
  for (const name of missingModels) {
    console.error(`Missing model: ${name}`);
  }
  for (const name of missingEnums) {
    console.error(`Missing enum: ${name}`);
  }
  if (balance !== 0) {
    console.error("Brace balance check failed.");
  }
  process.exit(1);
}

console.log(`Prisma schema structural verification passed (${requiredModels.length} models, ${requiredEnums.length} enums checked).`);

