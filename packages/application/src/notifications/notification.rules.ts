// Notification module business rules:
// - notification categories
// - channel/category preference evaluation
// - template rendering

export const NOTIFICATION_CHANNELS = ["PUSH", "EMAIL", "SMS", "WHATSAPP", "IN_APP"] as const;
export type NotificationChannelValue = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_CATEGORIES = [
  "BOOKING",
  "PAYMENT",
  "TUTOR",
  "VERIFICATION",
  "SYSTEM",
  "MARKETING",
  "SAFETY",
] as const;
export type NotificationCategoryValue = (typeof NOTIFICATION_CATEGORIES)[number];

/** Categories that bypass user preferences and are always delivered. */
export const MANDATORY_CATEGORIES: NotificationCategoryValue[] = [
  "SYSTEM",
  "SAFETY",
  "PAYMENT",
];

/** The default set of channels used when expanding an outbox event. */
export const DEFAULT_DISPATCH_CHANNELS: string[] = ["PUSH", "IN_APP"];

/** Map an outbox event name to a notification category. */
export function deriveCategory(eventName: string): NotificationCategoryValue {
  const upper = eventName.toUpperCase();
  if (upper.startsWith("BOOKING") || upper.startsWith("CLASS") || upper.startsWith("SESSION")) {
    return "BOOKING";
  }
  if (upper.startsWith("PAYMENT") || upper.startsWith("REFUND") || upper.startsWith("INVOICE")) {
    return "PAYMENT";
  }
  if (upper.startsWith("TUTOR") || upper.startsWith("VERIFICATION")) {
    return "VERIFICATION";
  }
  if (upper.startsWith("SAFETY") || upper.startsWith("SECURITY") || upper.startsWith("REPORT")) {
    return "SAFETY";
  }
  if (upper.startsWith("MARKETING") || upper.startsWith("PROMO") || upper.startsWith("REFERRAL")) {
    return "MARKETING";
  }
  return "SYSTEM";
}

export function isMandatoryCategory(category: string): boolean {
  return (MANDATORY_CATEGORIES as string[]).includes(category);
}

/**
 * Render a Mustache-style template ("Hello {{name}}") using the provided
 * variables. Unknown tokens are replaced with an empty string.
 */
export function renderTemplate(template: string, variables: Record<string, any> | null | undefined): string {
  if (!template) return "";
  const vars = variables ?? {};
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
    const value = key.split(".").reduce<any>((acc, part) => {
      if (acc && typeof acc === "object" && part in acc) return acc[part];
      return undefined;
    }, vars);
    return value === undefined || value === null ? "" : String(value);
  });
}