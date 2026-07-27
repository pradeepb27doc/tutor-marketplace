export const BOOKING_STATUS_TABS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export type BookingStatusTab = (typeof BOOKING_STATUS_TABS)[number]["value"];

export const BOOKING_STATUS_FILTERS = [
  "REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED_BY_PARENT",
  "CANCELLED_BY_TUTOR",
  "COMPLETED",
  "RESCHEDULED",
  "EXPIRED",
] as const;

export const DEFAULT_LIST_LIMIT = 20;