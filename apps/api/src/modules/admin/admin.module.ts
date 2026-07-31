import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller.js";
import {
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
} from "@tutor-marketplace/application";
import {
  PrismaAdminRepository,
  PrismaUserRepository,
  PrismaBookingRepository,
  PrismaTutorAvailabilitySlotRepository,
  SystemClock,
} from "@tutor-marketplace/infrastructure";

@Module({
  controllers: [AdminController],
  providers: [
    // Use Cases
    {
      provide: ListUsersUseCase,
      useFactory: (adminRepo: any) => new ListUsersUseCase(adminRepo),
      inject: ["AdminRepository"],
    },
    {
      provide: GetUserUseCase,
      useFactory: (adminRepo: any) => new GetUserUseCase(adminRepo),
      inject: ["AdminRepository"],
    },
    {
      provide: SuspendUserUseCase,
      useFactory: (userRepo: any, adminRepo: any) =>
        new SuspendUserUseCase(userRepo, adminRepo),
      inject: ["UserRepository", "AdminRepository"],
    },
    {
      provide: ActivateUserUseCase,
      useFactory: (userRepo: any, adminRepo: any) =>
        new ActivateUserUseCase(userRepo, adminRepo),
      inject: ["UserRepository", "AdminRepository"],
    },
    {
      provide: ListTutorsUseCase,
      useFactory: (adminRepo: any) => new ListTutorsUseCase(adminRepo),
      inject: ["AdminRepository"],
    },
    {
      provide: ListBookingsUseCase,
      useFactory: (adminRepo: any) => new ListBookingsUseCase(adminRepo),
      inject: ["AdminRepository"],
    },
    {
      provide: AdminGetBookingUseCase,
      useFactory: (adminRepo: any) => new AdminGetBookingUseCase(adminRepo),
      inject: ["AdminRepository"],
    },
    {
      provide: AdminCancelBookingUseCase,
      useFactory: (
        bookingRepo: any,
        slotRepo: any,
        adminRepo: any,
        clock: any,
      ) => new AdminCancelBookingUseCase(bookingRepo, slotRepo, adminRepo, clock),
      inject: [
        "BookingRepository",
        "TutorAvailabilitySlotRepository",
        "AdminRepository",
        "Clock",
      ],
    },
    {
      provide: ListPaymentsUseCase,
      useFactory: (adminRepo: any) => new ListPaymentsUseCase(adminRepo),
      inject: ["AdminRepository"],
    },
    {
      provide: AdminListRefundsUseCase,
      useFactory: (adminRepo: any) => new AdminListRefundsUseCase(adminRepo),
      inject: ["AdminRepository"],
    },
    {
      provide: GetAdminOverviewUseCase,
      useFactory: (adminRepo: any) => new GetAdminOverviewUseCase(adminRepo),
      inject: ["AdminRepository"],
    },
    {
      provide: ListAuditLogsUseCase,
      useFactory: (adminRepo: any) => new ListAuditLogsUseCase(adminRepo),
      inject: ["AdminRepository"],
    },

    // Repositories
    {
      provide: "AdminRepository",
      useClass: PrismaAdminRepository,
    },
    {
      provide: "UserRepository",
      useClass: PrismaUserRepository,
    },
    {
      provide: "BookingRepository",
      useClass: PrismaBookingRepository,
    },
    {
      provide: "TutorAvailabilitySlotRepository",
      useClass: PrismaTutorAvailabilitySlotRepository,
    },
    {
      provide: "Clock",
      useClass: SystemClock,
    },
  ],
})
export class AdminModule {}