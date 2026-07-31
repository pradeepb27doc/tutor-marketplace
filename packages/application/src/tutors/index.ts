export { CreateTutorProfileUseCase } from "./create-tutor-profile.use-case.js";
export { GetMyTutorProfileUseCase, GetPublicTutorProfileUseCase } from "./get-tutor-profile.use-case.js";
export { UpdateTutorProfileUseCase } from "./update-tutor-profile.use-case.js";
export { DashboardUseCase } from "./dashboard.use-case.js";
export { AddTutorSubjectUseCase, RemoveTutorSubjectUseCase, ListTutorSubjectsUseCase } from "./tutor-subject.use-cases.js";
export { ListQualificationsUseCase, AddQualificationUseCase, UpdateQualificationUseCase, RemoveQualificationUseCase } from "./qualification.use-cases.js";
export { ListLanguagesUseCase, AddLanguageUseCase, RemoveLanguageUseCase } from "./language.use-cases.js";
export { ListServiceAreasUseCase, AddServiceAreaUseCase, RemoveServiceAreaUseCase } from "./service-area.use-cases.js";

// --- Verification (Milestone 9C) ---
export {
  GetVerificationStatusUseCase,
  UploadVerificationDocumentUseCase,
  SubmitVerificationUseCase,
  ListVerificationCasesUseCase,
  GetVerificationCaseUseCase,
  ApproveVerificationUseCase,
  RejectVerificationUseCase,
  RequestChangesVerificationUseCase,
} from "./verification.use-cases.js";

export { REQUIRED_VERIFICATION_TYPES } from "./verification.repository.js";
export type {
  TutorProfileDto, PublicTutorProfileDto, CreateTutorProfileInput, UpdateTutorProfileInput,
  DashboardSummaryDto, TutorSubjectDto, AddTutorSubjectInput,
  TutorQualificationDto, AddQualificationInput, UpdateQualificationInput,
  TutorLanguageDto, AddLanguageInput,
  TutorServiceAreaDto, AddServiceAreaInput,
} from "./tutor.dtos.js";
export type {
  TutorRepository, TutorRecord, CreateTutorRecord,
  TutorSubjectRepository, TutorSubjectRecord, CreateTutorSubjectRecord,
  TutorQualificationRepository, TutorQualificationRecord, CreateTutorQualificationRecord,
  TutorLanguageRepository, TutorLanguageRecord, CreateTutorLanguageRecord,
  TutorServiceAreaRepository, TutorServiceAreaRecord, CreateTutorServiceAreaRecord,
} from "./tutor.repository.js";

// --- Verification repository interfaces & DTOs ---
export type {
  TutorVerificationRepository,
  VerificationCheckRecord,
  VerificationDocumentRecord,
  CreateVerificationDocumentRecord,
  UpsertVerificationCheckInput,
  VerificationCaseSummaryRecord,
  VerificationTypeValue,
  VerificationStatusValue,
  DocumentStatusValue,
} from "./verification.repository.js";
export type {
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
} from "./verification.dtos.js";

// --- Availability (Milestone 10B) ---
export {
  TutorNotFoundError,
  WeeklySlotOwnershipError,
  SlotOverlapError,
  InvalidTimeRangeError,
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
} from "./availability.use-cases.js";
export type {
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
} from "./availability.repository.js";
export type {
  TutorWeeklySlotDto,
  AddWeeklySlotInput,
  UpdateWeeklySlotInput,
  TutorBreakPeriodDto,
  AddBreakPeriodInput,
  TutorBlackoutPeriodDto,
  AddBlackoutPeriodInput,
  WeeklyAvailabilityDto,
  PublicAvailabilityDto,
  PublicAvailabilityDayDto,
} from "./availability.dtos.js";
