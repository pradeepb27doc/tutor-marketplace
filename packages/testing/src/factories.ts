import type { UserRecord, CreateUserRecord, TutorRecord, CreateTutorRecord, ParentRecord, BookingRecord, CreateBookingRecord, PaymentRecord, CreatePaymentRecord, SubjectRecord, SessionRecord, CreateSessionRecord, OtpChallengeRecord, CreateOtpChallengeRecord, StudentRecord, CreateStudentRecord } from "@tutor-marketplace/application";
import { UserRole, UserStatus, OtpPurpose } from "@tutor-marketplace/domain";

let _counter = 0;
function nextId(prefix = "test"): string {
  _counter++;
  return `${prefix}-${_counter}-${Date.now()}`;
}

/**
 * Build a UserRecord from a CreateUserRecord input.
 * All optional fields get sensible defaults.
 */
export function buildUserRecord(input?: Partial<CreateUserRecord>): UserRecord {
  const id = nextId("user");
  return {
    id,
    publicId: `pub-${id}`,
    email: input?.email ?? "user@example.com",
    phone: input?.phone ?? null,
    passwordHash: input?.passwordHash ?? null,
    displayName: input?.displayName ?? "Test User",
    avatarUrl: null,
    status: "ACTIVE",
    primaryRole: (input?.primaryRole as UserRole) ?? UserRole.PARENT,
    locale: input?.locale ?? "en-IN",
    timezone: input?.timezone ?? "Asia/Kolkata",
    emailVerifiedAt: input?.email ? new Date() : null,
    phoneVerifiedAt: input?.phone ? new Date() : null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

/**
 * Build a TutorRecord.
 */
export function buildTutorRecord(input?: Partial<CreateTutorRecord & { id: string }>): TutorRecord {
  return {
    id: input?.id ?? nextId("tutor"),
    userId: input?.userId ?? nextId("user"),
    status: "ACTIVE",
    headline: input?.headline ?? "Expert Tutor",
    bio: input?.bio ?? "Tutor bio",
    gender: null,
    experienceYears: 5,
    city: input?.city ?? "Mumbai",
    locality: null,
    latitude: null,
    longitude: null,
    baseHourlyRate: "500.00",
    currency: "INR",
    profileCompletionScore: 80,
    averageRating: "4.50",
    reviewCount: 10,
    completedClassesCount: 50,
    cancellationRate: "2.00",
    responseRate: "95.00",
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

/**
 * Build a ParentRecord.
 */
export function buildParentRecord(input?: { id?: string; userId?: string; city?: string; preferredLanguage?: string }): ParentRecord {
  return {
    id: input?.id ?? nextId("parent"),
    userId: input?.userId ?? nextId("user"),
    city: input?.city ?? "Mumbai",
    preferredLanguage: input?.preferredLanguage ?? "en",
    referralCode: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Build a SubjectRecord.
 */
export function buildSubjectRecord(input?: { name?: string; category?: string }): SubjectRecord & { name: string } {
  const name = input?.name ?? "Mathematics";
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return {
    id: nextId("subject"),
    slug,
    name,
    category: input?.category ?? "ACADEMIC",
    parentSubjectId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Build a BookingRecord.
 */
export function buildBookingRecord(input?: Partial<CreateBookingRecord>): BookingRecord {
  return {
    id: input?.id ?? nextId("booking"),
    publicId: `pub-${nextId("booking")}`,
    parentId: input?.parentId ?? nextId("parent"),
    tutorId: input?.tutorId ?? nextId("tutor"),
    studentId: input?.studentId ?? nextId("student"),
    subjectId: input?.subjectId ?? nextId("subject"),
    tutorSubjectId: null,
    availabilitySlotId: null,
    classType: "REGULAR",
    serviceMode: "ONLINE",
    status: "PENDING_PAYMENT",
    startAt: new Date("2026-07-20T10:00:00.000Z"),
    endAt: new Date("2026-07-20T11:00:00.000Z"),
    timezone: "Asia/Kolkata",
    durationMinutes: 60,
    city: "Mumbai",
    address: null,
    meetingUrl: null,
    priceAmount: "500.00",
    platformFeeAmount: "50.00",
    tutorEarningsAmount: "450.00",
    currency: "INR",
    rescheduledFromBookingId: null,
    cancellationReason: null,
    acceptedAt: null,
    rejectedAt: null,
    cancelledAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Build a PaymentRecord.
 */
export function buildPaymentRecord(input?: Partial<CreatePaymentRecord>): PaymentRecord {
  return {
    id: input?.id ?? nextId("payment"),
    bookingId: input?.bookingId ?? nextId("booking"),
    parentId: input?.parentId ?? nextId("parent"),
    provider: input?.provider ?? "RAZORPAY",
    status: input?.status ?? "PENDING",
    amount: input?.amount ?? "500.00",
    platformFeeAmount: input?.platformFeeAmount ?? "50.00",
    currency: input?.currency ?? "INR",
    providerOrderId: input?.providerOrderId ?? null,
    providerPaymentId: input?.providerPaymentId ?? null,
    idempotencyKey: input?.idempotencyKey ?? null,
    authorizedAt: null,
    capturedAt: null,
    failedAt: null,
    failureReason: null,
    invoiceMetadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Build a SessionRecord.
 */
export function buildSessionRecord(input?: Partial<CreateSessionRecord>): SessionRecord {
  return {
    id: input?.id ?? nextId("session"),
    userId: input?.userId ?? nextId("user"),
    refreshTokenHash: input?.refreshTokenHash ?? "refresh-hash",
    deviceId: input?.deviceId ?? null,
    ipAddress: input?.ipAddress ?? null,
    userAgent: input?.userAgent ?? null,
    expiresAt: input?.expiresAt ?? new Date("2026-08-14T00:00:00.000Z"),
    revokedAt: null,
    createdAt: new Date(),
  };
}

/**
 * Build an OtpChallengeRecord.
 */
export function buildOtpChallengeRecord(input?: Partial<CreateOtpChallengeRecord>): OtpChallengeRecord {
  return {
    id: nextId("otp"),
    userId: input?.userId ?? null,
    purpose: input?.purpose ?? OtpPurpose.LOGIN,
    phone: input?.phone ?? "+919999999999",
    email: input?.email ?? null,
    codeHash: input?.codeHash ?? "fake-otp-hash-123456",
    attempts: 0,
    expiresAt: input?.expiresAt ?? new Date(Date.now() + 10 * 60 * 1000),
    consumedAt: null,
    createdAt: new Date(),
  };
}

/**
 * Build a StudentRecord.
 */
export function buildStudentRecord(input?: Partial<CreateStudentRecord>): StudentRecord {
  return {
    id: nextId("student"),
    userId: null,
    fullName: input?.fullName ?? "Test Student",
    dateOfBirth: input?.dateOfBirth ?? null,
    gender: input?.gender ?? null,
    grade: input?.grade ?? null,
    curriculum: input?.curriculum ?? null,
    schoolName: input?.schoolName ?? null,
    learningGoals: input?.learningGoals ?? null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}