export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatFee(
  rate: string | null,
  currency: string,
): string {
  if (!rate) return "Contact for fee";
  const amount = Number.parseFloat(rate);
  if (Number.isNaN(amount)) return "Contact for fee";
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${Math.round(amount).toLocaleString()}/hr`;
}

export function formatExperience(years: number): string {
  if (years === 0) return "Fresher";
  if (years === 1) return "1 year";
  return `${years} years`;
}

export function formatRating(value: string): string {
  const num = Number.parseFloat(value);
  return Number.isNaN(num) ? "0.0" : num.toFixed(1);
}