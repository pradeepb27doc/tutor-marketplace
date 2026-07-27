export const DASHBOARD_PAGE_SIZE = 10;

export const STUDENT_LIMIT = 20;

export const EMPTY_MESSAGES = {
  students: "No students added yet. Add your first child to get started.",
  upcomingBookings: "No upcoming classes scheduled.",
  recentBookings: "No booking history yet.",
  payments: "No payment transactions found.",
  savedTutors: "No saved tutors yet.",
} as const;

export const SECTION_LABELS = {
  students: "Students",
  upcomingBookings: "Upcoming Classes",
  recentBookings: "Recent Bookings",
  payments: "Payment History",
  quickActions: "Quick Actions",
} as const;