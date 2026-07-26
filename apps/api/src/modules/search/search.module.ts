import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller.js";
import {
  SearchTutorsUseCase,
  GetPublicTutorDetailUseCase,
} from "@tutor-marketplace/application";
import {
  PrismaTutorSearchRepository,
  PrismaTutorRepository,
  PrismaTutorSubjectRepository,
  PrismaTutorQualificationRepository,
  PrismaTutorLanguageRepository,
  PrismaTutorServiceAreaRepository,
  PrismaTutorVerificationRepository,
  PrismaUserRepository,
} from "@tutor-marketplace/infrastructure";

@Module({
  controllers: [SearchController],
  providers: [
    {
      provide: SearchTutorsUseCase,
      useFactory: (searchRepo: any) => new SearchTutorsUseCase(searchRepo),
      inject: ["TutorSearchRepository"],
    },
    {
      provide: GetPublicTutorDetailUseCase,
      useFactory: (
        tutorRepo: any,
        tutorSubjectRepo: any,
        qualificationRepo: any,
        languageRepo: any,
        serviceAreaRepo: any,
        verificationRepo: any,
        userRepo: any,
      ) =>
        new GetPublicTutorDetailUseCase(
          tutorRepo,
          tutorSubjectRepo,
          qualificationRepo,
          languageRepo,
          serviceAreaRepo,
          verificationRepo,
          userRepo,
        ),
      inject: [
        "TutorRepository",
        "TutorSubjectRepository",
        "TutorQualificationRepository",
        "TutorLanguageRepository",
        "TutorServiceAreaRepository",
        "TutorVerificationRepository",
        "UserRepository",
      ],
    },
    {
      provide: "TutorSearchRepository",
      useClass: PrismaTutorSearchRepository,
    },
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
      provide: "TutorVerificationRepository",
      useClass: PrismaTutorVerificationRepository,
    },
    {
      provide: "UserRepository",
      useClass: PrismaUserRepository,
    },
  ],
})
export class SearchModule {}