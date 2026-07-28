export type TutorDashboardSummary = {
  profileCompletionPercent: number;
  completedClassesCount: number;
  averageRating: string;
  reviewCount: number;
  activeSubjectCount: number;
  status: string;
};

export type TutorBooking = {
  id: string;
  status: string;
  subjectName: string;
  studentName: string;
  scheduledAt: string;
  durationMinutes: number;
};

export type WeeklySlot = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timezone: string;
  serviceMode: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
};

export type BreakPeriod = {
  id: string;
  dayOfWeek: string | null;
  startTime: string;
  endTime: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TutorAvailability = {
  weeklySlots: WeeklySlot[];
  breaks: BreakPeriod[];
};

export type TutorVerificationStatus = {
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  documents: {
    type: string;
    status: string;
    documentUrl: string;
    uploadedAt: string;
  }[];
};

export type SlotFormData = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  serviceMode: string;
  timezone?: string;
  capacity?: number;
};

export type BreakFormData = {
  dayOfWeek?: string | null;
  startTime: string;
  endTime: string;
  reason?: string | null;
};

export type FieldErrors = Record<string, string>;

export type MutationResult = {
  success: boolean;
  fieldErrors?: FieldErrors;
  error?: string;
};
