import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const spec = readFileSync(resolve("docs/RestApiSpecification.md"), "utf8");

const requiredSections = [
  "## 5. Authentication",
  "## 8. Standard Error Shape",
  "## 9. Pagination, Filtering, and Sorting",
  "## 10. Idempotency",
  "## 16. Search and Matching API",
  "## 18. Booking API",
  "## 19. Payment API",
  "## 20. Webhook API",
  "## 29. Admin API"
];

const requiredPaths = [
  "/auth/otp/start",
  "/auth/otp/verify",
  "/me",
  "/parents/me/students",
  "/search/tutors",
  "/tutors/me/verification/submit",
  "/bookings/checkout",
  "/bookings/{bookingId}/accept",
  "/payments/{paymentId}/confirm-client-result",
  "/webhooks/razorpay",
  "/admin/verifications/{tutorId}/approve",
  "/admin/audit-logs"
];

const missingSections = requiredSections.filter((section) => !spec.includes(section));
const missingPaths = requiredPaths.filter((path) => !spec.includes(path));

if (missingSections.length > 0 || missingPaths.length > 0) {
  console.error("REST API specification verification failed.");
  for (const section of missingSections) {
    console.error(`Missing section: ${section}`);
  }
  for (const path of missingPaths) {
    console.error(`Missing path: ${path}`);
  }
  process.exit(1);
}

console.log(`REST API specification verification passed (${requiredSections.length} sections, ${requiredPaths.length} paths checked).`);

