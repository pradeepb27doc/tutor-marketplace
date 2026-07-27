// Legacy types - kept for backward compatibility with existing components
// New booking types are in features/booking/types/

export interface Tutor {
  id: string;
  name: string;
  initials: string;
  title: string;
  badge: string;
  rating: string;
  reviewCount: number;
  subjects: string[];
  experience: string;
  location: string;
  teachingMode: string;
  hourlyRate: string;
  trialRate: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface DayAvailability {
  date: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  slots: TimeSlot[];
}

export interface StudentDetails {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  ageOrGrade: string;
  subject: string;
  learningGoals: string;
}

export interface BookingData {
  tutor: Tutor;
  selectedDay: DayAvailability | null;
  selectedSlot: TimeSlot | null;
  studentDetails: StudentDetails;
}

export type BookingStep = "calendar" | "details" | "review";

export interface PricingBreakdown {
  label: string;
  amount: string;
}