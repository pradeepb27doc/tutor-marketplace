import { Module } from "@nestjs/common";
import { VerificationController } from "./verification.controller.js";
import {
  GetVerificationStatusUseCase,
  UploadVerificationDocumentUseCase,
  SubmitVerificationUseCase,
  ListVerificationCasesUseCase,
  GetVerificationCaseUseCase,
  ApproveVerificationUseCase,
  RejectVerificationUseCase,
  RequestChangesVerificationUseCase,
} from "@tutor-marketplace/application";
import {
  PrismaTutorVerificationRepository,
  PrismaTutorRepository,
} from "@tutor-marketplace/infrastructure";

@Module({
  controllers: [VerificationController],
  providers: [
    // Use Cases (tutor-facing)
    {
      provide: GetVerificationStatusUseCase,
      useFactory: (tutorRepo: any, verificationRepo: any) =>
        new GetVerificationStatusUseCase(tutorRepo, verificationRepo),
      inject: ["TutorRepository", "TutorVerificationRepository"],
    },
    {
      provide: UploadVerificationDocumentUseCase,
      useFactory: (tutorRepo: any, verificationRepo: any) =>
        new UploadVerificationDocumentUseCase(tutorRepo, verificationRepo),
      inject: ["TutorRepository", "TutorVerificationRepository"],
    },
    {
      provide: SubmitVerificationUseCase,
      useFactory: (tutorRepo: any, verificationRepo: any, clock: any) =>
        new SubmitVerificationUseCase(tutorRepo, verificationRepo, clock),
      inject: ["TutorRepository", "TutorVerificationRepository", "Clock"],
    },
    // Use Cases (admin-facing)
    {
      provide: ListVerificationCasesUseCase,
      useFactory: (verificationRepo: any) =>
        new ListVerificationCasesUseCase(verificationRepo),
      inject: ["TutorVerificationRepository"],
    },
    {
      provide: GetVerificationCaseUseCase,
      useFactory: (verificationRepo: any) =>
        new GetVerificationCaseUseCase(verificationRepo),
      inject: ["TutorVerificationRepository"],
    },
    {
      provide: ApproveVerificationUseCase,
      useFactory: (verificationRepo: any, clock: any) =>
        new ApproveVerificationUseCase(verificationRepo, clock),
      inject: ["TutorVerificationRepository", "Clock"],
    },
    {
      provide: RejectVerificationUseCase,
      useFactory: (verificationRepo: any, clock: any) =>
        new RejectVerificationUseCase(verificationRepo, clock),
      inject: ["TutorVerificationRepository", "Clock"],
    },
    {
      provide: RequestChangesVerificationUseCase,
      useFactory: (verificationRepo: any, clock: any) =>
        new RequestChangesVerificationUseCase(verificationRepo, clock),
      inject: ["TutorVerificationRepository", "Clock"],
    },

    // Repositories
    {
      provide: "TutorVerificationRepository",
      useClass: PrismaTutorVerificationRepository,
    },
    {
      provide: "TutorRepository",
      useClass: PrismaTutorRepository,
    },
  ],
})
export class VerificationModule {}