export const BOOKING_STEPS = ["calendar", "details", "review"] as const;

export type BookingStep = (typeof BOOKING_STEPS)[number];

export const STEP_LABELS: Record<BookingStep, string> = {
  calendar: "Select date & time",
  details: "Student details",
  review: "Review & confirm",
};

export const STEP_DESCRIPTIONS: Record<BookingStep, string> = {
  calendar: "Choose a day and available time slot for your trial class.",
  details: "Tell us about the student so the tutor can prepare.",
  review: "Review all details before confirming your booking.",
};

export const INITIAL_STUDENT_DETAILS = {
  studentName: "",
  studentEmail: "",
  studentPhone: "",
  ageOrGrade: "",
  subject: "",
  learningGoals: "",
};

export const PLATFORM_FEE_PERCENT = 10;

export const DEFAULT_TIMEZONE = "Asia/Kolkata";