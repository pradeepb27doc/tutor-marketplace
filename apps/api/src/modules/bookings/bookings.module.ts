import { Module } from "@nestjs/common";
import { BookingsController } from "./bookings.controller.js";
import {
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
} from "@tutor-marketplace/application";
import {
  PrismaBookingRepository,
  PrismaTutorAvailabilitySlotRepository,
  PrismaTutorRepository,
  PrismaParentRepository,
  PrismaStudentRepository,
  PrismaTutorSubjectRepository,
} from "@tutor-marketplace/infrastructure";
import { SystemClock } from "@tutor-marketplace/infrastructure";

@Module({
  controllers: [BookingsController],
  exports: [
    "BookingRepository",
    "TutorRepository",
    "ParentRepository",
  ],
  providers: [
    // Use Cases
    {
      provide: CreateBookingUseCase,
      useFactory: (
        bookingRepo: any,
        slotRepo: any,
        tutorRepo: any,
        parentRepo: any,
        studentRepo: any,
        tutorSubjectRepo: any,
        clock: any,
      ) => new CreateBookingUseCase(bookingRepo, slotRepo, tutorRepo, parentRepo, studentRepo, tutorSubjectRepo, clock),
      inject: [
        "BookingRepository",
        "TutorAvailabilitySlotRepository",
        "TutorRepository",
        "ParentRepository",
        "StudentRepository",
        "TutorSubjectRepository",
        "Clock",
      ],
    },
    {
      provide: AcceptBookingUseCase,
      useFactory: (bookingRepo: any, slotRepo: any, tutorRepo: any, clock: any) =>
        new AcceptBookingUseCase(bookingRepo, slotRepo, tutorRepo, clock),
      inject: ["BookingRepository", "TutorAvailabilitySlotRepository", "TutorRepository", "Clock"],
    },
    {
      provide: RejectBookingUseCase,
      useFactory: (bookingRepo: any, slotRepo: any, tutorRepo: any, clock: any) =>
        new RejectBookingUseCase(bookingRepo, slotRepo, tutorRepo, clock),
      inject: ["BookingRepository", "TutorAvailabilitySlotRepository", "TutorRepository", "Clock"],
    },
    {
      provide: CancelBookingByParentUseCase,
      useFactory: (bookingRepo: any, slotRepo: any, parentRepo: any, clock: any) =>
        new CancelBookingByParentUseCase(bookingRepo, slotRepo, parentRepo, clock),
      inject: ["BookingRepository", "TutorAvailabilitySlotRepository", "ParentRepository", "Clock"],
    },
    {
      provide: CancelBookingByTutorUseCase,
      useFactory: (bookingRepo: any, slotRepo: any, tutorRepo: any, clock: any) =>
        new CancelBookingByTutorUseCase(bookingRepo, slotRepo, tutorRepo, clock),
      inject: ["BookingRepository", "TutorAvailabilitySlotRepository", "TutorRepository", "Clock"],
    },
    {
      provide: RescheduleBookingUseCase,
      useFactory: (
        bookingRepo: any,
        slotRepo: any,
        parentRepo: any,
        tutorRepo: any,
        studentRepo: any,
        tutorSubjectRepo: any,
        clock: any,
      ) => new RescheduleBookingUseCase(bookingRepo, slotRepo, parentRepo, tutorRepo, studentRepo, tutorSubjectRepo, clock),
      inject: [
        "BookingRepository",
        "TutorAvailabilitySlotRepository",
        "ParentRepository",
        "TutorRepository",
        "StudentRepository",
        "TutorSubjectRepository",
        "Clock",
      ],
    },
    {
      provide: CompleteBookingUseCase,
      useFactory: (bookingRepo: any, tutorRepo: any, clock: any) =>
        new CompleteBookingUseCase(bookingRepo, tutorRepo, clock),
      inject: ["BookingRepository", "TutorRepository", "Clock"],
    },
    {
      provide: GetBookingUseCase,
      useFactory: (bookingRepo: any, parentRepo: any, tutorRepo: any) =>
        new GetBookingUseCase(bookingRepo, parentRepo, tutorRepo),
      inject: ["BookingRepository", "ParentRepository", "TutorRepository"],
    },
    {
      provide: GetBookingHistoryUseCase,
      useFactory: (bookingRepo: any, parentRepo: any, tutorRepo: any) =>
        new GetBookingHistoryUseCase(bookingRepo, parentRepo, tutorRepo),
      inject: ["BookingRepository", "ParentRepository", "TutorRepository"],
    },
    {
      provide: ListParentBookingsUseCase,
      useFactory: (bookingRepo: any, parentRepo: any) =>
        new ListParentBookingsUseCase(bookingRepo, parentRepo),
      inject: ["BookingRepository", "ParentRepository"],
    },
    {
      provide: ListTutorBookingsUseCase,
      useFactory: (bookingRepo: any, tutorRepo: any) =>
        new ListTutorBookingsUseCase(bookingRepo, tutorRepo),
      inject: ["BookingRepository", "TutorRepository"],
    },

    // Repositories
    {
      provide: "BookingRepository",
      useClass: PrismaBookingRepository,
    },
    {
      provide: "TutorAvailabilitySlotRepository",
      useClass: PrismaTutorAvailabilitySlotRepository,
    },
    {
      provide: "TutorRepository",
      useClass: PrismaTutorRepository,
    },
    {
      provide: "ParentRepository",
      useClass: PrismaParentRepository,
    },
    {
      provide: "StudentRepository",
      useClass: PrismaStudentRepository,
    },
    {
      provide: "TutorSubjectRepository",
      useClass: PrismaTutorSubjectRepository,
    },
    {
      provide: "Clock",
      useClass: SystemClock,
    },
  ],
})
export class BookingsModule {}