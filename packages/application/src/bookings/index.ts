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
} from "./booking.use-cases.js";

export type {
  BookingRepository,
  TutorAvailabilitySlotRepository,
  BookingRecord,
  TutorAvailabilitySlotRecord,
  CreateBookingRecord,
  CreateConcreteSlotRecord,
  StatusHistoryRecord,
  CreateStatusHistoryRecord,
  BookingQueryOptions,
} from "./booking.repository.js";

export type {
  CreateBookingInput,
  RescheduleBookingInput,
  BookingQueryInput,
  BookingDto,
  StatusHistoryEntryDto,
  RescheduleResultDto,
} from "./booking.dtos.js";

export {
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
  TutorNotFoundError,
  ParentNotFoundError,
} from "./booking.errors.js";

export {
  isAllowedTransition,
  activeBookingStatuses,
  isSlotOccupied,
  assertCancellable,
  assertCompletable,
  calculateDurationMinutes,
  timeRangesOverlap,
  getDefaultExpiryDurationMs,
  getDefaultReservationDurationMs,
} from "./booking.rules.js";