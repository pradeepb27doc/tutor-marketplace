import { Module } from "@nestjs/common";
import { TutorsController } from "./tutors.controller.js";
import {
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
} from "@tutor-marketplace/application";
import {
  PrismaTutorRepository,
  PrismaTutorSubjectRepository,
  PrismaTutorQualificationRepository,
  PrismaTutorLanguageRepository,
  PrismaTutorServiceAreaRepository,
  PrismaSubjectRepository,
  PrismaTutorWeeklySlotRepository,
  PrismaTutorBreakPeriodRepository,
  PrismaTutorBlackoutRepository,
} from "@tutor-marketplace/infrastructure";

@Module({
  controllers: [TutorsController],
  providers: [
    // Use Cases
    {
      provide: CreateTutorProfileUseCase,
      useFactory: (tutorRepo: any, roleRepo: any) =>
        new CreateTutorProfileUseCase(tutorRepo, roleRepo),
      inject: ["TutorRepository", "UserRoleRepository"],
    },
    {
      provide: GetMyTutorProfileUseCase,
      useFactory: (tutorRepo: any) => new GetMyTutorProfileUseCase(tutorRepo),
      inject: ["TutorRepository"],
    },
    {
      provide: GetPublicTutorProfileUseCase,
      useFactory: (tutorRepo: any, tutorSubjectRepo: any) =>
        new GetPublicTutorProfileUseCase(tutorRepo, tutorSubjectRepo),
      inject: ["TutorRepository", "TutorSubjectRepository"],
    },
    {
      provide: UpdateTutorProfileUseCase,
      useFactory: (tutorRepo: any) => new UpdateTutorProfileUseCase(tutorRepo),
      inject: ["TutorRepository"],
    },
    {
      provide: DashboardUseCase,
      useFactory: (tutorRepo: any, tutorSubjectRepo: any) =>
        new DashboardUseCase(tutorRepo, tutorSubjectRepo),
      inject: ["TutorRepository", "TutorSubjectRepository"],
    },
    {
      provide: AddTutorSubjectUseCase,
      useFactory: (tutorRepo: any, subjectRepo: any, tutorSubjectRepo: any) =>
        new AddTutorSubjectUseCase(tutorRepo, subjectRepo, tutorSubjectRepo),
      inject: ["TutorRepository", "SubjectRepository", "TutorSubjectRepository"],
    },
    {
      provide: RemoveTutorSubjectUseCase,
      useFactory: (tutorRepo: any, tutorSubjectRepo: any) =>
        new RemoveTutorSubjectUseCase(tutorRepo, tutorSubjectRepo),
      inject: ["TutorRepository", "TutorSubjectRepository"],
    },
    {
      provide: ListTutorSubjectsUseCase,
      useFactory: (tutorRepo: any, tutorSubjectRepo: any) =>
        new ListTutorSubjectsUseCase(tutorRepo, tutorSubjectRepo),
      inject: ["TutorRepository", "TutorSubjectRepository"],
    },
    {
      provide: ListQualificationsUseCase,
      useFactory: (tutorRepo: any, qualificationRepo: any) =>
        new ListQualificationsUseCase(tutorRepo, qualificationRepo),
      inject: ["TutorRepository", "TutorQualificationRepository"],
    },
    {
      provide: AddQualificationUseCase,
      useFactory: (tutorRepo: any, qualificationRepo: any) =>
        new AddQualificationUseCase(tutorRepo, qualificationRepo),
      inject: ["TutorRepository", "TutorQualificationRepository"],
    },
    {
      provide: UpdateQualificationUseCase,
      useFactory: (tutorRepo: any, qualificationRepo: any) =>
        new UpdateQualificationUseCase(tutorRepo, qualificationRepo),
      inject: ["TutorRepository", "TutorQualificationRepository"],
    },
    {
      provide: RemoveQualificationUseCase,
      useFactory: (tutorRepo: any, qualificationRepo: any) =>
        new RemoveQualificationUseCase(tutorRepo, qualificationRepo),
      inject: ["TutorRepository", "TutorQualificationRepository"],
    },
    {
      provide: ListLanguagesUseCase,
      useFactory: (tutorRepo: any, languageRepo: any) =>
        new ListLanguagesUseCase(tutorRepo, languageRepo),
      inject: ["TutorRepository", "TutorLanguageRepository"],
    },
    {
      provide: AddLanguageUseCase,
      useFactory: (tutorRepo: any, languageRepo: any) =>
        new AddLanguageUseCase(tutorRepo, languageRepo),
      inject: ["TutorRepository", "TutorLanguageRepository"],
    },
    {
      provide: RemoveLanguageUseCase,
      useFactory: (tutorRepo: any, languageRepo: any) =>
        new RemoveLanguageUseCase(tutorRepo, languageRepo),
      inject: ["TutorRepository", "TutorLanguageRepository"],
    },
    {
      provide: ListServiceAreasUseCase,
      useFactory: (tutorRepo: any, serviceAreaRepo: any) =>
        new ListServiceAreasUseCase(tutorRepo, serviceAreaRepo),
      inject: ["TutorRepository", "TutorServiceAreaRepository"],
    },
    {
      provide: AddServiceAreaUseCase,
      useFactory: (tutorRepo: any, serviceAreaRepo: any) =>
        new AddServiceAreaUseCase(tutorRepo, serviceAreaRepo),
      inject: ["TutorRepository", "TutorServiceAreaRepository"],
    },
    {
      provide: RemoveServiceAreaUseCase,
      useFactory: (tutorRepo: any, serviceAreaRepo: any) =>
        new RemoveServiceAreaUseCase(tutorRepo, serviceAreaRepo),
      inject: ["TutorRepository", "TutorServiceAreaRepository"],
    },

    // --- Availability (Milestone 10B) use cases ---
    {
      provide: ListWeeklyAvailabilityUseCase,
      useFactory: (tutorRepo: any, weeklySlotRepo: any, breakRepo: any) =>
        new ListWeeklyAvailabilityUseCase(tutorRepo, weeklySlotRepo, breakRepo),
      inject: ["TutorRepository", "TutorWeeklySlotRepository", "TutorBreakPeriodRepository"],
    },
    {
      provide: AddWeeklySlotUseCase,
      useFactory: (tutorRepo: any, weeklySlotRepo: any) =>
        new AddWeeklySlotUseCase(tutorRepo, weeklySlotRepo),
      inject: ["TutorRepository", "TutorWeeklySlotRepository"],
    },
    {
      provide: UpdateWeeklySlotUseCase,
      useFactory: (tutorRepo: any, weeklySlotRepo: any) =>
        new UpdateWeeklySlotUseCase(tutorRepo, weeklySlotRepo),
      inject: ["TutorRepository", "TutorWeeklySlotRepository"],
    },
    {
      provide: RemoveWeeklySlotUseCase,
      useFactory: (tutorRepo: any, weeklySlotRepo: any) =>
        new RemoveWeeklySlotUseCase(tutorRepo, weeklySlotRepo),
      inject: ["TutorRepository", "TutorWeeklySlotRepository"],
    },
    {
      provide: AddBreakPeriodUseCase,
      useFactory: (tutorRepo: any, breakRepo: any) =>
        new AddBreakPeriodUseCase(tutorRepo, breakRepo),
      inject: ["TutorRepository", "TutorBreakPeriodRepository"],
    },
    {
      provide: RemoveBreakPeriodUseCase,
      useFactory: (tutorRepo: any, breakRepo: any) =>
        new RemoveBreakPeriodUseCase(tutorRepo, breakRepo),
      inject: ["TutorRepository", "TutorBreakPeriodRepository"],
    },
    {
      provide: ListBlackoutPeriodsUseCase,
      useFactory: (tutorRepo: any, blackoutRepo: any) =>
        new ListBlackoutPeriodsUseCase(tutorRepo, blackoutRepo),
      inject: ["TutorRepository", "TutorBlackoutPeriodRepository"],
    },
    {
      provide: AddBlackoutPeriodUseCase,
      useFactory: (tutorRepo: any, blackoutRepo: any) =>
        new AddBlackoutPeriodUseCase(tutorRepo, blackoutRepo),
      inject: ["TutorRepository", "TutorBlackoutPeriodRepository"],
    },
    {
      provide: RemoveBlackoutPeriodUseCase,
      useFactory: (tutorRepo: any, blackoutRepo: any) =>
        new RemoveBlackoutPeriodUseCase(tutorRepo, blackoutRepo),
      inject: ["TutorRepository", "TutorBlackoutPeriodRepository"],
    },
    {
      provide: GetPublicAvailabilityUseCase,
      useFactory: (
        tutorRepo: any,
        weeklySlotRepo: any,
        breakRepo: any,
        blackoutRepo: any,
      ) =>
        new GetPublicAvailabilityUseCase(
          tutorRepo,
          weeklySlotRepo,
          breakRepo,
          blackoutRepo,
        ),
      inject: [
        "TutorRepository",
        "TutorWeeklySlotRepository",
        "TutorBreakPeriodRepository",
        "TutorBlackoutPeriodRepository",
      ],
    },

    // Repositories
    {
      provide: "TutorRepository",
      useClass: PrismaTutorRepository,
    },
    {
      provide: "TutorSubjectRepository",
      useClass: PrismaTutorSubjectRepository,
    },
    {
      provide: "TutorQualificationRepository",
      useClass: PrismaTutorQualificationRepository,
    },
    {
      provide: "TutorLanguageRepository",
      useClass: PrismaTutorLanguageRepository,
    },
    {
      provide: "TutorServiceAreaRepository",
      useClass: PrismaTutorServiceAreaRepository,
    },
    {
      provide: "SubjectRepository",
      useClass: PrismaSubjectRepository,
    },
    {
      provide: "TutorWeeklySlotRepository",
      useClass: PrismaTutorWeeklySlotRepository,
    },
    {
      provide: "TutorBreakPeriodRepository",
      useClass: PrismaTutorBreakPeriodRepository,
    },
    {
      provide: "TutorBlackoutPeriodRepository",
      useClass: PrismaTutorBlackoutRepository,
    },
  ],
})
export class TutorsModule {}