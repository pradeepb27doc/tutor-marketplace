import type { UserRecord, CreateUserRecord, TutorRecord, CreateTutorRecord, ParentRecord, BookingRecord, CreateBookingRecord, PaymentRecord, CreatePaymentRecord, SessionRecord, CreateSessionRecord, OtpChallengeRecord, CreateOtpChallengeRecord, StudentRecord, CreateStudentRecord } from "@tutor-marketplace/application";
import { buildUserRecord, buildTutorRecord, buildParentRecord, buildBookingRecord, buildPaymentRecord, buildSubjectRecord, buildSessionRecord, buildOtpChallengeRecord, buildStudentRecord } from "./factories.js";

/**
 * Create a complete user fixture with all related records pre-built.
 * Returns plain records for unit tests without database dependency.
 */
export function createUserFixture(overrides?: Partial<CreateUserRecord>): {
  input: CreateUserRecord;
  record: UserRecord;
} {
  const input: CreateUserRecord = {
    email: "test@example.com",
    phone: "+919999999999",
    primaryRole: "PARENT",
    displayName: "Test User",
    locale: "en-IN",
    timezone: "Asia/Kolkata",
    ...overrides,
  };

  const record = buildUserRecord(input);
  return { input, record };
}

/**
 * Create a complete tutor fixture with related user record.
 */
export function createTutorFixture(overrides?: Partial<CreateTutorRecord>): {
  input: CreateTutorRecord;
  record: TutorRecord;
  user: UserRecord;
} {
  const user = buildUserRecord({ primaryRole: "TUTOR", email: "tutor@example.com" });
  const input: CreateTutorRecord = {
    userId: user.id,
    headline: "Experienced Math Tutor",
    bio: "Expert in mathematics",
    city: "Mumbai",
    ...overrides,
  };

  const record = buildTutorRecord({ ...input, userId: user.id });
  return { input, record, user };
}

/**
 * Create a complete parent fixture with related user record.
 */
export function createParentFixture(overrides?: { userId?: string }): {
  parent: ParentRecord;
  user: UserRecord;
} {
  const user = buildUserRecord({ primaryRole: "PARENT", email: "parent@example.com" });
  const parent = buildParentRecord({ userId: overrides?.userId ?? user.id });
  return { parent, user };
}

/**
 * Create a booking fixture with nested subject and tutor references.
 */
export function createBookingFixture(overrides?: {
  parentId?: string;
  tutorId?: string;
  studentId?: string;
  subjectId?: string;
}): {
  booking: BookingRecord;
  subject: { id: string; name: string };
} {
  const subject = buildSubjectRecord();
  const booking = buildBookingRecord({
    parentId: overrides?.parentId ?? "parent-id",
    tutorId: overrides?.tutorId ?? "tutor-id",
    studentId: overrides?.studentId ?? "student-id",
    subjectId: overrides?.subjectId ?? subject.id,
  });
  return { booking, subject };
}

/**
 * Create a payment fixture for testing payment flows.
 */
export function createPaymentFixture(overrides?: {
  bookingId?: string;
  parentId?: string;
}): {
  payment: PaymentRecord;
} {
  const payment = buildPaymentRecord({
    bookingId: overrides?.bookingId ?? "booking-id",
    parentId: overrides?.parentId ?? "parent-id",
  });
  return { payment };
}

/**
 * Create a subject fixture for catalog tests.
 */
export function createSubjectFixture(overrides?: {
  name?: string;
  category?: string;
}): {
  id: string;
  name: string;
  slug: string;
  category: string;
} {
  const subject = buildSubjectRecord(overrides);
  return subject;
}

/**
 * Create a session fixture for session-related tests.
 */
export function createSessionFixture(overrides?: Partial<CreateSessionRecord>): {
  input: CreateSessionRecord;
  session: SessionRecord;
} {
  const input: CreateSessionRecord = {
    userId: "test-user-id",
    refreshTokenHash: "test-refresh-hash",
    expiresAt: new Date("2026-08-14T00:00:00.000Z"),
    ...overrides,
  };

  const session = buildSessionRecord(input);
  return { input, session };
}

/**
 * Create an OTP challenge fixture for OTP-related tests.
 */
export function createOtpChallengeFixture(overrides?: Partial<CreateOtpChallengeRecord>): {
  input: CreateOtpChallengeRecord;
  challenge: OtpChallengeRecord;
} {
  const input: CreateOtpChallengeRecord = {
    purpose: "LOGIN",
    phone: "+919999999999",
    codeHash: "fake-otp-hash-123456",
    expiresAt: new Date("2026-07-14T00:10:00.000Z"),
    ...overrides,
  };

  const challenge = buildOtpChallengeRecord(input);
  return { input, challenge };
}

/**
 * Create a student fixture for profile tests.
 */
export function createStudentFixture(overrides?: Partial<CreateStudentRecord>): {
  input: CreateStudentRecord;
  student: StudentRecord;
} {
  const input: CreateStudentRecord = {
    fullName: "Test Student",
    grade: 10,
    curriculum: "CBSE",
    ...overrides,
  };

  const student = buildStudentRecord(input);
  return { input, student };
}