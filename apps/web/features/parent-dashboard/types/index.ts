export interface ParentProfileResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentResponse {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY";
  grade?: number;
  curriculum?: "CBSE" | "ICSE" | "IGCSE" | "IB" | "STATE_BOARD" | "OTHER";
  schoolName?: string;
  learningGoals?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED_BY_PARENT"
  | "CANCELLED_BY_TUTOR"
  | "COMPLETED"
  | "RESCHEDULED"
  | "EXPIRED";

export interface TutorSummary {
  id: string;
  fullName: string;
  headline?: string;
  hourlyRate?: number;
  avatarUrl?: string;
}

export interface BookingResponse {
  id: string;
  parentId: string;
  studentId: string;
  student?: StudentResponse;
  tutorId: string;
  tutor?: TutorSummary;
  subjectId?: string;
  subjectName?: string;
  status: BookingStatus;
  scheduledStart: string;
  scheduledEnd: string;
  durationMinutes: number;
  amount: number;
  currency: string;
  paymentStatus?: string;
  meetingLink?: string;
  meetingType?: string;
  cancelReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  id: string;
  parentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  method?: string;
  refundedAmount?: number;
  failureReason?: string;
  capturedAt?: string;
  refundedAt?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  transactions?: PaymentTransactionResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransactionResponse {
  id: string;
  paymentId: string;
  eventType: string;
  providerStatus: string;
  amount?: number;
  currency?: string;
  providerResponse: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  upcomingClasses: number;
  completedBookings: number;
  cancelledBookings: number;
  totalStudents: number;
  pendingPayments: number;
  totalSpent: number;
}

export interface ListResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  limit?: number;
}

export interface DashboardState {
  profile: ParentProfileResponse | null;
  students: ListResponse<StudentResponse>;
  upcomingBookings: ListResponse<BookingResponse>;
  recentBookings: ListResponse<BookingResponse>;
  payments: ListResponse<PaymentResponse>;
  stats: DashboardStats;
}

export type LoadStatus = "idle" | "loading" | "success" | "error";

export interface DashboardLoadingState {
  profile: LoadStatus;
  students: LoadStatus;
  upcomingBookings: LoadStatus;
  recentBookings: LoadStatus;
  payments: LoadStatus;
}

export interface DashboardErrorState {
  profile: string | null;
  students: string | null;
  upcomingBookings: string | null;
  recentBookings: string | null;
  payments: string | null;
}

export type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";

export function bookingStatusToVariant(status: BookingStatus): StatusVariant {
  switch (status) {
    case "REQUESTED":
    case "ACCEPTED":
      return "info";
    case "COMPLETED":
      return "success";
    case "CANCELLED_BY_PARENT":
    case "CANCELLED_BY_TUTOR":
    case "REJECTED":
      return "danger";
    case "RESCHEDULED":
      return "warning";
    case "EXPIRED":
      return "default";
    default:
      return "default";
  }
}

export function formatBookingStatus(status: BookingStatus): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatPaymentStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}