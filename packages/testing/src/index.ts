// Testing infrastructure exports
export { setupTestEnvironment, teardownTestEnvironment } from "./setup.js";
export { createTestDatabase, resetTestDatabase } from "./database.js";
export { FakeAuthTokensService, FakePasswordService, FakeOtpService, FakeOtpSender, FakeClock, FakeCurrentUserProvider } from "./fakes.js";
export {
  FakeUserRepository,
  FakeUserRoleRepository,
  FakeSubjectRepository,
  FakeTutorRepository,
  FakeTutorSubjectRepository,
  FakeTutorQualificationRepository,
  FakeTutorLanguageRepository,
  FakeTutorServiceAreaRepository,
  FakeTutorWeeklySlotRepository,
  FakeTutorBreakPeriodRepository,
  FakeTutorBlackoutPeriodRepository,
  FakeTutorVerificationRepository,
  FakeTutorSearchRepository,
  buildSearchCard,
} from "./fakes-tutor.js";
export {
  FakeParentProfileRepository,
  FakeStudentOwnershipRepository,
  FakeBookingRepository,
  FakeTutorAvailabilitySlotRepository,
  FakePaymentRepository,
  FakePaymentGateway,
} from "./fakes-booking-payment.js";
export { createUserFixture, createTutorFixture, createParentFixture, createBookingFixture, createPaymentFixture, createSubjectFixture } from "./fixtures.js";
export { buildUserRecord, buildTutorRecord, buildParentRecord, buildBookingRecord, buildPaymentRecord, buildSubjectRecord, buildSessionRecord, buildOtpChallengeRecord, buildStudentRecord } from "./factories.js";