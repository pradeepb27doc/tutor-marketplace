import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies Razorpay webhook payloads using HMAC-SHA256.
 *
 * Razorpay sends the signature in the `x-razorpay-signature` header and computes it as:
 *   HMAC_SHA256(webhookSecret, rawRequestBody)
 */
export function verifyRazorpayWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(signature);
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}