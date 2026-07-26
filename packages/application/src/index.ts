  export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

export interface Clock {
  now(): Date;
}

// --- Auth Ports ---

export interface TokenPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokensService {
  generateTokenPair(payload: TokenPayload): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  hashRefreshToken(token: string): Promise<string>;
  verifyRefreshToken(token: string, hash: string): Promise<boolean>;
}

export interface PasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface OtpService {
  generateCode(): string;
  hashCode(code: string): Promise<string>;
  verifyCode(code: string, hash: string): Promise<boolean>;
}

export interface OtpSender {
  sendOtp(channel: "PHONE" | "EMAIL", destination: string, code: string): Promise<void>;
}

// --- Current User Context ---

export interface CurrentUserProvider {
  getUserId(): string;
  getUserRole(): string;
}

// --- Auth DTOs ---

export interface OtpStartInput {
  channel: "PHONE" | "EMAIL";
  destination: string;
  purpose: "LOGIN" | "SIGNUP" | "PHONE_VERIFICATION" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";
}

export interface OtpStartResult {
  challengeId: string;
  expiresInSeconds: number;
}

export interface OtpVerifyInput {
  challengeId: string;
  code: string;
  channel: "PHONE" | "EMAIL";
}

export interface OtpVerifyResult {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface UserDto {
  id: string;
  displayName: string | null;
  primaryRole: string;
  roles: string[];
  status: string;
  email: string | null;
  phone: string | null;
}

export interface CurrentUserDto extends UserDto {
  locale: string;
  timezone: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface SessionDto {
  id: string;
  deviceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

// --- Auth Repositories ---

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findByPhone(phone: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(data: CreateUserRecord): Promise<UserRecord>;
  update(id: string, data: Partial<UserRecord>): Promise<UserRecord>;
}

export interface UserRecord {
  id: string;
  publicId: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: string;
  primaryRole: string;
  locale: string;
  timezone: string;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUserRecord {
  email?: string | null;
  phone?: string | null;
  passwordHash?: string | null;
  displayName?: string | null;
  primaryRole: string;
  locale?: string;
  timezone?: string;
}

export interface UserRoleRecord {
  id: string;
  userId: string;
  role: string;
}

export interface UserRoleRepository {
  findByUserId(userId: string): Promise<UserRoleRecord[]>;
  assignRole(userId: string, role: string): Promise<UserRoleRecord>;
}

export interface SessionRepository {
  create(data: CreateSessionRecord): Promise<SessionRecord>;
  findById(id: string): Promise<SessionRecord | null>;
  findByRefreshTokenHash(hash: string): Promise<SessionRecord | null>;
  listByUserId(userId: string): Promise<SessionRecord[]>;
  revoke(id: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}

export interface SessionRecord {
  id: string;
  userId: string;
  refreshTokenHash: string;
  deviceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface CreateSessionRecord {
  userId: string;
  refreshTokenHash: string;
  deviceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

export interface OtpChallengeRecord {
  id: string;
  userId: string | null;
  purpose: string;
  phone: string | null;
  email: string | null;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

export interface OtpChallengeRepository {
  create(data: CreateOtpChallengeRecord): Promise<OtpChallengeRecord>;
  findById(id: string): Promise<OtpChallengeRecord | null>;
  markConsumed(id: string): Promise<void>;
  incrementAttempts(id: string): Promise<void>;
}

export interface CreateOtpChallengeRecord {
  userId?: string | null;
  purpose: string;
  phone?: string | null;
  email?: string | null;
  codeHash: string;
  expiresAt: Date;
}

// --- Profile DTOs ---

export interface ParentProfileDto {
  id: string;
  userId: string;
  city: string | null;
  preferredLanguage: string;
  referralCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateParentProfileInput {
  city?: string;
  preferredLanguage?: string;
}

export interface StudentDto {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  grade: number | null;
  curriculum: string | null;
  schoolName: string | null;
  learningGoals: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentInput {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  grade?: number;
  curriculum?: string;
  schoolName?: string;
  learningGoals?: string;
}

export interface UpdateStudentInput {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  grade?: number;
  curriculum?: string;
  schoolName?: string;
  learningGoals?: string;
  notes?: string;
}

// --- Profile Repositories ---

export interface ParentRepository {
  findByUserId(userId: string): Promise<ParentRecord | null>;
  updateByUserId(userId: string, data: Partial<ParentRecord>): Promise<ParentRecord>;
}

export interface ParentRecord {
  id: string;
  userId: string;
  city: string | null;
  preferredLanguage: string;
  referralCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentRepository {
  findById(id: string): Promise<StudentRecord | null>;
  findByParentId(parentId: string): Promise<StudentRecord[]>;
  create(data: CreateStudentRecord): Promise<StudentRecord>;
  update(id: string, data: Partial<StudentRecord>): Promise<StudentRecord>;
  softDelete(id: string): Promise<void>;
  verifyParentOwnership(studentId: string, parentId: string): Promise<boolean>;
  createGuardianLink(studentId: string, parentId: string, relationToChild?: string): Promise<void>;
}

export interface StudentRecord {
  id: string;
  userId: string | null;
  fullName: string;
  dateOfBirth: Date | null;
  gender: string | null;
  grade: number | null;
  curriculum: string | null;
  schoolName: string | null;
  learningGoals: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateStudentRecord {
  fullName: string;
  dateOfBirth?: Date | null;
  gender?: string | null;
  grade?: number | null;
  curriculum?: string | null;
  schoolName?: string | null;
  learningGoals?: string | null;
}

// --- Catalog DTOs ---

export interface SubjectDto {
  id: string;
  slug: string;
  name: string;
  category: string;
  parentSubjectId: string | null;
  isActive: boolean;
  children?: SubjectDto[];
}

export interface SubjectRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  parentSubjectId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectRepository {
  findAllActive(): Promise<SubjectRecord[]>;
  findBySlug(slug: string): Promise<SubjectRecord | null>;
}

// --- Re-exports ---

export {
  OtpStartUseCase,
  OtpVerifyUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  LogoutAllUseCase,
  GetCurrentUserUseCase,
  ListSessionsUseCase,
  RevokeSessionUseCase,
} from "./auth/index.js";

export {
  AuthError,
  InvalidCredentialsError,
  OtpExpiredError,
  OtpInvalidError,
  OtpMaxAttemptsError,
  UserNotFoundError,
  UserSuspendedError,
  SessionExpiredError,
  InvalidTokenError,
  TokenExpiredError,
} from "./auth/errors.js";

export {
  GetParentProfileUseCase,
  UpdateParentProfileUseCase,
  ListStudentsUseCase,
  CreateStudentUseCase,
  GetStudentUseCase,
  UpdateStudentUseCase,
  DeleteStudentUseCase,
} from "./profiles/index.js";

export {
  ListSubjectsUseCase,
  GetSubjectUseCase,
} from "./catalog/index.js";
export type { GetSubjectInput } from "./catalog/index.js";

export {
  CreateTutorProfileUseCase,
  GetMyTutorProfileUseCase,
  GetPublicTutorProfileUseCase,
  UpdateTutorProfileUseCase,
  DashboardUseCase,
  AddTutorSubjectUseCase,
  RemoveTutorSubjectUseCase,
  ListTutorSubjectsUseCase,
  ListQualificationsUseCase,
  AddQualificationUseCase,
  UpdateQualificationUseCase,
  RemoveQualificationUseCase,
  ListLanguagesUseCase,
  AddLanguageUseCase,
  RemoveLanguageUseCase,
  ListServiceAreasUseCase,
  AddServiceAreaUseCase,
  RemoveServiceAreaUseCase,
  GetVerificationStatusUseCase,
  UploadVerificationDocumentUseCase,
  SubmitVerificationUseCase,
  ListVerificationCasesUseCase,
  GetVerificationCaseUseCase,
  ApproveVerificationUseCase,
  RejectVerificationUseCase,
  RequestChangesVerificationUseCase,
  REQUIRED_VERIFICATION_TYPES,
  ListWeeklyAvailabilityUseCase,
  AddWeeklySlotUseCase,
  UpdateWeeklySlotUseCase,
  RemoveWeeklySlotUseCase,
  AddBreakPeriodUseCase,
  RemoveBreakPeriodUseCase,
  ListBlackoutPeriodsUseCase,
  AddBlackoutPeriodUseCase,
  RemoveBlackoutPeriodUseCase,
  GetPublicAvailabilityUseCase,
  TutorNotFoundError,
  WeeklySlotOwnershipError,
  SlotOverlapError,
  InvalidTimeRangeError,
} from "./tutors/index.js";
export type {
  TutorProfileDto,
  PublicTutorProfileDto,
  CreateTutorProfileInput,
  UpdateTutorProfileInput,
  DashboardSummaryDto,
  TutorSubjectDto,
  AddTutorSubjectInput,
  TutorQualificationDto,
  AddQualificationInput,
  UpdateQualificationInput,
  TutorLanguageDto,
  AddLanguageInput,
  TutorServiceAreaDto,
  AddServiceAreaInput,
  TutorRepository,
  TutorRecord,
  CreateTutorRecord,
  TutorSubjectRepository,
  TutorSubjectRecord,
  CreateTutorSubjectRecord,
  TutorQualificationRepository,
  TutorQualificationRecord,
  CreateTutorQualificationRecord,
  TutorLanguageRepository,
  TutorLanguageRecord,
  CreateTutorLanguageRecord,
  TutorServiceAreaRepository,
  TutorServiceAreaRecord,
  CreateTutorServiceAreaRecord,
  TutorWeeklySlotRepository,
  TutorWeeklySlotRecord,
  CreateTutorWeeklySlotRecord,
  UpdateTutorWeeklySlotRecord,
  TutorBreakPeriodRepository,
  TutorBreakPeriodRecord,
  CreateTutorBreakPeriodRecord,
  TutorBlackoutPeriodRepository,
  TutorBlackoutPeriodRecord,
  CreateTutorBlackoutPeriodRecord,
  DayOfWeekValue,
  TutorVerificationRepository,
  VerificationCheckRecord,
  VerificationDocumentRecord,
  CreateVerificationDocumentRecord,
  UpsertVerificationCheckInput,
  VerificationCaseSummaryRecord,
  VerificationTypeValue,
  VerificationStatusValue,
  DocumentStatusValue,
  VerificationStatusDto,
  VerificationCaseDto,
  VerificationCaseSummaryDto,
  VerificationCaseCheckDto,
  ListVerificationCasesResultDto,
  VerificationDocumentDto,
  VerificationCheckDto,
  UploadVerificationDocumentInput,
  SubmitVerificationResultDto,
  ApproveVerificationResultDto,
  RejectVerificationResultDto,
  RequestChangesResultDto,
} from "./tutors/index.js";

export {
  SearchTutorsUseCase,
  GetPublicTutorDetailUseCase,
} from "./search/index.js";
export type {
  TutorSortKey,
  TutorSearchMode,
  TutorSearchFilters,
  TutorSearchQuery,
  TutorSearchCardRecord,
  TutorSearchResult,
  TutorSearchRepository,
  TutorCardDto,
  TutorSearchResultDto,
  TutorSearchSubjectDto,
  PublicTutorDetailDto,
  PublicTutorSubjectDto,
  PublicTutorQualificationDto,
  PublicTutorLanguageDto,
  PublicTutorServiceAreaDto,
  PublicTutorVerificationSummaryDto,
  SearchTutorsQueryDto,
} from "./search/index.js";

// --- Payments (Milestone 11A) ---

export {
  CreatePaymentOrderUseCase,
  VerifyPaymentUseCase,
  CapturePaymentUseCase,
  RetryPaymentUseCase,
  InitiateRefundUseCase,
  ApproveRefundUseCase,
  RejectRefundUseCase,
  GetPaymentUseCase,
  ListParentPaymentsUseCase,
  ListAllPaymentsUseCase,
  GetPaymentHistoryUseCase,
  GetRefundStatusUseCase,
  ListRefundsUseCase,
  ProcessPaymentWebhookUseCase,
  GetPaymentSummaryUseCase,
  CancelPaymentUseCase,
  PaymentGatewayRegistry,
  GatewayNotConfiguredError,
  PaymentNotFoundError,
  PaymentOwnershipError,
  InvalidPaymentStatusError,
  PaymentVerificationError,
  PaymentCaptureError,
  RefundProcessingError,
  RefundAmountExceededError,
  IdempotencyKeyConflictError,
  BookingNotPayableError,
  PAYMENT_STATUSES,
  REFUND_STATUSES,
  PAYMENT_EVENTS,
  PAYABLE_BOOKING_STATUSES,
  REFUNDABLE_BOOKING_STATUSES,
} from "./payments/index.js";

export type {
  PaymentRepository,
  PaymentRecord,
  CreatePaymentRecord,
  PaymentTransactionRecord,
  CreatePaymentTransactionRecord,
  PaymentWebhookRecord,
  CreatePaymentWebhookRecord,
  RefundRecord,
  CreateRefundRecord,
  PaymentQueryOptions,
  RefundQueryOptions,
  PaymentSummary,
  PaymentGatewayPort,
  CreateGatewayOrderParams,
  GatewayOrderResult,
  VerifyGatewayPaymentParams,
  GatewayPaymentVerificationResult,
  CaptureGatewayPaymentParams,
  GatewayCaptureResult,
  GatewayRefundParams,
  GatewayRefundResult,
  GatewayPaymentStatusResult,
  ProcessWebhookInput,
  CreatePaymentOrderInput,
  VerifyPaymentInput,
  InitiateRefundInput,
  PaymentQueryInput,
  RefundQueryInput,
  PaymentOrderDto,
  PaymentDto,
  PaymentWithTransactionsDto,
  PaymentTransactionDto,
  RefundDto,
  PaymentSummaryDto,
} from "./payments/index.js";

// --- Bookings (Milestone 10C) ---

export {
  CreateBookingUseCase,
  AcceptBookingUseCase,
  RejectBookingUseCase,
  CancelBookingByParentUseCase,
  CancelBookingByTutorUseCase,
  RescheduleBookingUseCase,
  CompleteBookingUseCase,
  GetBookingUseCase,
  GetBookingHistoryUseCase,
  ListParentBookingsUseCase,
  ListTutorBookingsUseCase,
  ExpireStaleBookingsUseCase,
  BookingNotFoundError,
  BookingOwnershipError,
  InvalidBookingStatusError,
  SlotNotFoundError,
  SlotNotAvailableError,
  SlotAlreadyReservedError,
  SlotExpiredError,
  StudentOwnershipError,
  SubjectNotOfferedByTutorError,
  OverlappingBookingError,
  CancellationWindowExceededError,
  BookingCannotBeCompletedError,
  ParentNotFoundError,
  isAllowedTransition,
  activeBookingStatuses,
  isSlotOccupied,
  assertCancellable,
  assertCompletable,
  calculateDurationMinutes,
  timeRangesOverlap,
  getDefaultExpiryDurationMs,
  getDefaultReservationDurationMs,
} from "./bookings/index.js";
export type {
  BookingRecord,
  BookingRepository,
  CreateBookingRecord,
  StatusHistoryRecord,
  CreateStatusHistoryRecord,
  BookingQueryOptions,
  TutorAvailabilitySlotRecord,
  TutorAvailabilitySlotRepository,
  CreateConcreteSlotRecord,
} from "./bookings/index.js";
export type {
  CreateBookingInput,
  RescheduleBookingInput,
  BookingQueryInput,
  BookingDto,
  StatusHistoryEntryDto,
  RescheduleResultDto,
} from "./bookings/index.js";

// --- Reviews (Milestone 11C) ---

export {
  SubmitReviewUseCase,
  ModerateReviewUseCase,
  GetReviewUseCase,
  ListTutorReviewsUseCase,
  ListMyReviewsUseCase,
  ListPendingModerationReviewsUseCase,
  GetTutorRatingSummaryUseCase,
  ReviewNotFoundError,
  ReviewOwnershipError,
  DuplicateReviewError,
  InvalidRatingError,
  BookingNotCompletedError,
} from "./reviews/index.js";
export type {
  ReviewRepository,
  ReviewRecord,
  CreateReviewRecord,
  ReviewQueryOptions,
  CreateReviewInput,
  ModerateReviewInput,
  ReviewQueryInput,
  ReviewDto,
  TutorRatingSummaryDto,
  ReviewListDto,
} from "./reviews/index.js";

// --- Notifications (Milestone 11B) ---

export {
  ProcessOutboxEventUseCase,
  SendPendingNotificationsUseCase,
  DispatchOutboxEventsUseCase,
  ListUserNotificationsUseCase,
  MarkNotificationReadUseCase,
  GetUserNotificationPreferencesUseCase,
  UpdateNotificationPreferenceUseCase,
  RegisterDeviceTokenUseCase,
  NotificationProviderRegistry,
  ProviderNotConfiguredError,
  NotificationNotFoundError,
  NotificationOwnershipError,
  InvalidChannelError,
  InvalidPreferenceError,
  OutboxEventProcessedError,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CATEGORIES,
  MANDATORY_CATEGORIES,
  DEFAULT_DISPATCH_CHANNELS,
  deriveCategory,
  isMandatoryCategory,
  renderTemplate,
} from "./notifications/index.js";

export type {
  NotificationRecord,
  CreateNotificationRecord,
  ListNotificationOptions,
  NotificationRepository,
  NotificationTemplateRecord,
  NotificationPreferenceRecord,
  UpsertPreferenceRecord,
  DeviceRecord,
  UpsertDeviceRecord,
  DeviceRepository,
  OutboxEventRecord,
  OutboxEventRepository,
  CreateOutboxEventRecord,
  NotificationProvider,
  NotificationSendInput,
  NotificationSendResult,
  NotificationChannelValue,
  NotificationCategoryValue,
  NotificationDto,
  NotificationPreferenceDto,
  ListUserNotificationsInput,
  ListUserNotificationsResult,
  MarkNotificationReadInput,
  GetPreferencesInput,
  UpdatePreferenceInput,
  RegisterDeviceInput,
  ProcessOutboxEventInput,
  SendDueNotificationsInput,
  SendDueNotificationsResult,
  DispatchOutboxInput,
  DispatchOutboxResult,
} from "./notifications/index.js";

// --- Admin & Moderation (Milestone 11D) ---

export * from "./admin/admin.dtos.js";
export { AdminRepository } from "./admin/admin.repository.js";
export type {
  AdminUserSummary,
  AdminTutorSummary,
  AdminBookingSummary,
  AdminPaymentSummary,
  AdminRefundSummary,
  AuditLogRecord,
  AdminListQuery,
  AdminAuditLogQuery,
  CursorPage,
  CreateAuditLogInput,
  AdminOverview,
} from "./admin/admin.repository.js";
export {
  ListUsersUseCase,
  GetUserUseCase,
  SuspendUserUseCase,
  ActivateUserUseCase,
  ListTutorsUseCase,
  ListBookingsUseCase,
  AdminGetBookingUseCase,
  AdminCancelBookingUseCase,
  ListPaymentsUseCase,
  AdminListRefundsUseCase,
  GetAdminOverviewUseCase,
  ListAuditLogsUseCase,
  AdminResourceNotFoundError,
  InvalidUserStatusTransitionError,
} from "./admin/admin.use-cases.js";
