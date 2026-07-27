/**
 * Format integer minor currency units (e.g. paise) into a display string.
 * Example: 52820, "INR" → "₹528.20"
 */
export function formatMinorUnits(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const major = amount / 100;
  return `${symbol}${major.toFixed(2)}`;
}

/**
 * Format a decimal string (e.g. "499.00") into a display string.
 * Example: "499.00", "INR" → "₹499.00"
 */
export function formatDecimalString(amount: string, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const parsed = Number.parseFloat(amount);
  if (Number.isNaN(parsed)) return `${symbol}0.00`;
  return `${symbol}${parsed.toFixed(2)}`;
}

/**
 * Format an ISO date string into a human-readable date and time.
 * Example: "2026-07-27T10:00:00.000Z" → { date: "Jul 27, 2026", time: "10:00 AM" }
 */
export function formatTransactionTime(isoString: string): {
  date: string;
  time: string;
  full: string;
} {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return {
    date: dateStr,
    time: timeStr,
    full: `${dateStr} at ${timeStr}`,
  };
}

/**
 * Format a duration in minutes into a human-readable string.
 * Example: 60 → "1 hour", 90 → "1 hour 30 minutes", 45 → "45 minutes"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return `${mins} minute${mins > 1 ? "s" : ""}`;
}

function getCurrencySymbol(currency: string): string {
  switch (currency.toUpperCase()) {
    case "INR":
      return "₹";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return currency;
  }
}
