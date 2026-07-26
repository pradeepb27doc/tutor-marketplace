import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import type { Request } from "express";
import { Roles } from "../auth/roles.decorator.js";
import { CreateReviewDto } from "./dto/create-review.dto.js";
import { ModerateReviewDto } from "./dto/moderate-review.dto.js";
import { ReviewQueryDto } from "./dto/review-query.dto.js";
import {
  SubmitReviewUseCase,
  ModerateReviewUseCase,
  GetReviewUseCase,
  ListTutorReviewsUseCase,
  ListMyReviewsUseCase,
  ListPendingModerationReviewsUseCase,
  GetTutorRatingSummaryUseCase,
} from "@tutor-marketplace/application";
import { listResponse, normalizeCursorOffset } from "../../common/api-response.js";

@ApiTags("Reviews")
@ApiBearerAuth()
@Controller()
export class ReviewsController {
  constructor(
    private readonly submitReviewUseCase: SubmitReviewUseCase,
    private readonly moderateReviewUseCase: ModerateReviewUseCase,
    private readonly getReviewUseCase: GetReviewUseCase,
    private readonly listTutorReviewsUseCase: ListTutorReviewsUseCase,
    private readonly listMyReviewsUseCase: ListMyReviewsUseCase,
    private readonly listPendingModerationReviewsUseCase: ListPendingModerationReviewsUseCase,
    private readonly getTutorRatingSummaryUseCase: GetTutorRatingSummaryUseCase,
  ) {}

  // --- Submit Review (Parent) ---

  @Post("bookings/:bookingId/reviews")
  @HttpCode(HttpStatus.CREATED)
  @Roles("PARENT")
  @ApiOperation({ summary: "Submit a review for a completed booking" })
  @ApiParam({ name: "bookingId", description: "Booking ID" })
  async submit(
    @Req() req: Request,
    @Body() dto: CreateReviewDto,
    @Param("bookingId") bookingId: string,
  ) {
    const user = (req as any).user;
    return {
      data: await this.submitReviewUseCase.execute({
        userId: user.id,
        data: { ...dto, bookingId },
      }),
    };
  }

  // --- Publish Review (Admin) ---

  @Post("admin/reviews/:reviewId/publish")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "Publish a review (admin)" })
  @ApiParam({ name: "reviewId", description: "Review ID" })
  async publish(
    @Req() req: Request,
    @Param("reviewId") reviewId: string,
  ) {
    const user = (req as any).user;
    return {
      data: await this.moderateReviewUseCase.execute({
        userId: user.id,
        data: { reviewId, status: "PUBLISHED" as const },
      }),
    };
  }

  // --- Hide Review (Admin) ---

  @Post("admin/reviews/:reviewId/hide")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "Hide a review (admin)" })
  @ApiParam({ name: "reviewId", description: "Review ID" })
  async hide(
    @Req() req: Request,
    @Param("reviewId") reviewId: string,
  ) {
    const user = (req as any).user;
    return {
      data: await this.moderateReviewUseCase.execute({
        userId: user.id,
        data: { reviewId, status: "HIDDEN" as const },
      }),
    };
  }

  // --- Moderate Review (Admin) — generic route for FLAGGED or any status ---

  @Post("admin/reviews/:reviewId/moderate")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "Moderate a review with custom status (admin)" })
  @ApiParam({ name: "reviewId", description: "Review ID" })
  async moderate(
    @Req() req: Request,
    @Param("reviewId") reviewId: string,
    @Body() dto: ModerateReviewDto,
  ) {
    const user = (req as any).user;
    return {
      data: await this.moderateReviewUseCase.execute({
        userId: user.id,
        data: { reviewId, status: dto.status },
      }),
    };
  }

  // --- Get Review ---

  @Get("reviews/:reviewId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get review details by ID" })
  @ApiParam({ name: "reviewId", description: "Review ID" })
  async get(@Req() req: Request, @Param("reviewId") reviewId: string) {
    const user = (req as any).user;
    return {
      data: await this.getReviewUseCase.execute({ userId: user.id, reviewId }),
    };
  }

  // --- List My Reviews (Parent) ---

  @Get("reviews")
  @HttpCode(HttpStatus.OK)
  @Roles("PARENT")
  @ApiOperation({ summary: "List the current parent's reviews" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by status" })
  @ApiQuery({ name: "rating", required: false, type: Number, description: "Filter by rating" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  async listMyReviews(@Req() req: Request, @Query() query: ReviewQueryDto) {
    const user = (req as any).user;
    const data = await this.listMyReviewsUseCase.execute({
        userId: user.id,
        query: {
          status: query.status,
          rating: query.rating,
          limit: query.limit,
          offset: query.offset ?? normalizeCursorOffset(query.cursor),
        },
      });
    return listResponse(data, { limit: query.limit, cursor: query.cursor });
  }

  // --- List Tutor Reviews (Public) ---

  @Get("tutors/:tutorId/reviews")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List reviews for a tutor" })
  @ApiParam({ name: "tutorId", description: "Tutor ID" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by status" })
  @ApiQuery({ name: "rating", required: false, type: Number, description: "Filter by rating" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  async listTutorReviews(
    @Param("tutorId") tutorId: string,
    @Query() query: ReviewQueryDto,
  ) {
    const data = await this.listTutorReviewsUseCase.execute({
        tutorId,
        query: {
          status: query.status,
          rating: query.rating,
          limit: query.limit,
          offset: query.offset ?? normalizeCursorOffset(query.cursor),
        },
      });
    return listResponse(data, { limit: query.limit, cursor: query.cursor });
  }

  // --- Get Tutor Rating Summary (Public) ---

  @Get("tutors/:tutorId/ratings")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get rating summary for a tutor" })
  @ApiParam({ name: "tutorId", description: "Tutor ID" })
  async getTutorRatingSummary(@Param("tutorId") tutorId: string) {
    return {
      data: await this.getTutorRatingSummaryUseCase.execute({ tutorId }),
    };
  }

  // --- List Moderation Queue (Admin/Support) ---

  @Get("admin/reviews")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "List reviews for moderation queue (admin)" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by status" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  async listPendingModeration(
    @Req() req: Request,
    @Query() query: ReviewQueryDto,
  ) {
    const user = (req as any).user;
    const data = await this.listPendingModerationReviewsUseCase.execute({
        userId: user.id,
        limit: query.limit,
        offset: query.offset ?? normalizeCursorOffset(query.cursor),
      });
    return listResponse(data, { limit: query.limit, cursor: query.cursor });
  }
}