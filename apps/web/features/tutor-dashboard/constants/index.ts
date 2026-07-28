export const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type DayOfWeek = (typeof DAY_ORDER)[number];

export const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export const SERVICE_MODE_OPTIONS: { value: string; label: string }[] = [
  { value: "ONLINE", label: "Online" },
  { value: "HOME_TUITION", label: "Home Tuition" },
  { value: "GROUP_CLASS", label: "Group Class" },
  { value: "WEEKEND_CLASS", label: "Weekend Class" },
  { value: "HOLIDAY_CAMP", label: "Holiday Camp" },
];

export const SERVICE_MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  HOME: "Home",
  BOTH: "Online & Home",
  HOME_TUITION: "Home Tuition",
  GROUP_CLASS: "Group Class",
  WEEKEND_CLASS: "Weekend Class",
  HOLIDAY_CAMP: "Holiday Camp",
};

export const SERVICE_MODE_COLORS: Record<string, string> = {
  ONLINE: "bg-green-100 text-green-800",
  HOME: "bg-yellow-100 text-yellow-800",
  BOTH: "bg-blue-100 text-blue-800",
  HOME_TUITION: "bg-yellow-100 text-yellow-800",
  GROUP_CLASS: "bg-blue-100 text-blue-800",
  WEEKEND_CLASS: "bg-purple-100 text-purple-800",
  HOLIDAY_CAMP: "bg-orange-100 text-orange-800",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-100 text-red-800",
};

export const VERIFICATION_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CHANGES_REQUESTED: "bg-orange-100 text-orange-800",
};

export const DOCUMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};
