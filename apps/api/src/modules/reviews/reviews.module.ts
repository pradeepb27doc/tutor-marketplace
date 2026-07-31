import { Module } from "@nestjs/common";
import { ReviewsController } from "./reviews.controller.js";
import { BookingsModule } from "../bookings/bookings.module.js";
import {
  SubmitReviewUseCase,
  ModerateReviewUseCase,
  GetReviewUseCase,
  ListTutorReviewsUseCase,
  ListMyReviewsUseCase,
  ListPendingModerationReviewsUseCase,
  GetTutorRatingSummaryUseCase,
} from "@tutor-marketplace/application";
import {
  PrismaReviewRepository,
  PrismaParentRepository,
  PrismaTutorRepository,
} from "@tutor-marketplace/infrastructure";

@Module({
  controllers: [ReviewsController],
  imports: [BookingsModule],
  providers: [
    // Use Cases
    {
      provide: SubmitReviewUseCase,
      useFactory: (reviewRepo: any, bookingRepo: any, parentRepo: any, tutorRepo: any) =>
        new SubmitReviewUseCase(reviewRepo, bookingRepo, parentRepo, tutorRepo),
      inject: ["ReviewRepository", "BookingRepository", "ParentRepository", "TutorRepository"],
    },
    {
      provide: ModerateReviewUseCase,
      useFactory: (reviewRepo: any) =>
        new ModerateReviewUseCase(reviewRepo),
      inject: ["ReviewRepository"],
    },
    {
      provide: GetReviewUseCase,
      useFactory: (reviewRepo: any, parentRepo: any, tutorRepo: any) =>
        new GetReviewUseCase(reviewRepo, parentRepo, tutorRepo),
      inject: ["ReviewRepository", "ParentRepository", "TutorRepository"],
    },
    {
      provide: ListTutorReviewsUseCase,
      useFactory: (reviewRepo: any, tutorRepo: any) =>
        new ListTutorReviewsUseCase(reviewRepo, tutorRepo),
      inject: ["ReviewRepository", "TutorRepository"],
    },
    {
      provide: ListMyReviewsUseCase,
      useFactory: (reviewRepo: any, parentRepo: any) =>
        new ListMyReviewsUseCase(reviewRepo, parentRepo),
      inject: ["ReviewRepository", "ParentRepository"],
    },
    {
      provide: ListPendingModerationReviewsUseCase,
      useFactory: (reviewRepo: any) =>
        new ListPendingModerationReviewsUseCase(reviewRepo),
      inject: ["ReviewRepository"],
    },
    {
      provide: GetTutorRatingSummaryUseCase,
      useFactory: (reviewRepo: any, tutorRepo: any) =>
        new GetTutorRatingSummaryUseCase(reviewRepo, tutorRepo),
      inject: ["ReviewRepository", "TutorRepository"],
    },

    // Repositories
    {
      provide: "ReviewRepository",
      useClass: PrismaReviewRepository,
    },
  ],
})
export class ReviewsModule {}
