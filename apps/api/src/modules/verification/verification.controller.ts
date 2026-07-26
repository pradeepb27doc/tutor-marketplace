import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import type { Request } from "express";
import { Roles } from "../auth/roles.decorator.js";
import {
  GetVerificationStatusUseCase,
  UploadVerificationDocumentUseCase,
  SubmitVerificationUseCase,
  ListVerificationCasesUseCase,
  GetVerificationCaseUseCase,
  ApproveVerificationUseCase,
  RejectVerificationUseCase,
  RequestChangesVerificationUseCase,
  REQUIRED_VERIFICATION_TYPES,
  type VerificationStatusDto,
  type ListVerificationCasesResultDto,
  type VerificationCaseDto,
  type VerificationDocumentDto,
  type SubmitVerificationResultDto,
  type ApproveVerificationResultDto,
  type RejectVerificationResultDto,
  type RequestChangesResultDto,
} from "@tutor-marketplace/application";
import { UploadVerificationDocumentDto } from "./dto/upload-verification-document.dto.js";
import { ListVerificationCasesQueryDto } from "./dto/list-verification-cases-query.dto.js";
import { RejectVerificationDto, RequestChangesDto } from "./dto/admin-verification.dto.js";

@ApiTags("Tutor Verification")
@ApiBearerAuth()
@Controller()
export class VerificationController {
  constructor(
    private readonly getVerificationStatusUseCase: GetVerificationStatusUseCase,
    private readonly uploadVerificationDocumentUseCase: UploadVerificationDocumentUseCase,
    private readonly submitVerificationUseCase: SubmitVerificationUseCase,
    private readonly listVerificationCasesUseCase: ListVerificationCasesUseCase,
    private readonly getVerificationCaseUseCase: GetVerificationCaseUseCase,
    private readonly approveVerificationUseCase: ApproveVerificationUseCase,
    private readonly rejectVerificationUseCase: RejectVerificationUseCase,
    private readonly requestChangesVerificationUseCase: RequestChangesVerificationUseCase,
  ) {}

  // --- Tutor-facing ---

  @Get("tutors/me/verification")
  @HttpCode(HttpStatus.OK)
  @Roles("TUTOR")
  @ApiOperation({ summary: "Get the current tutor's verification status" })
  async getStatus(@Req() req: Request): Promise<{ data: VerificationStatusDto }> {
    const user = (req as any).user;
    return {
      data: await this.getVerificationStatusUseCase.execute({ userId: user.id }),
    };
  }

  @Post("tutors/me/verification/checks/:type/documents")
  @HttpCode(HttpStatus.CREATED)
  @Roles("TUTOR")
  @ApiOperation({ summary: "Register a verification document for a check type" })
  @ApiParam({ name: "type", description: "Verification type", enum: REQUIRED_VERIFICATION_TYPES, example: "GOVERNMENT_ID" })
  async uploadDocument(
    @Req() req: Request,
    @Param("type") type: string,
    @Body() dto: UploadVerificationDocumentDto,
  ): Promise<{ data: VerificationDocumentDto }> {
    const user = (req as any).user;
    return {
      data: await this.uploadVerificationDocumentUseCase.execute({
        userId: user.id,
        data: {
          ...dto,
          type: type as VerificationDocumentDto["type"],
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        },
      }),
    };
  }

  @Post("tutors/me/verification/submit")
  @HttpCode(HttpStatus.OK)
  @Roles("TUTOR")
  @ApiOperation({ summary: "Submit the tutor profile for verification review" })
  async submit(@Req() req: Request): Promise<{ data: SubmitVerificationResultDto }> {
    const user = (req as any).user;
    return {
      data: await this.submitVerificationUseCase.execute({ userId: user.id }),
    };
  }

  // --- Admin/Support-facing ---

  @Get("admin/verifications")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "List pending verification cases" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Cursor for pagination (tutor id from previous page)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Page size (default 20, max 100)" })
  async listCases(
    @Query() query: ListVerificationCasesQueryDto,
  ): Promise<ListVerificationCasesResultDto> {
    const result = await this.listVerificationCasesUseCase.execute({
      cursor: query.cursor ?? null,
      limit: query.limit,
    });
    return result;
  }

  @Get("admin/verifications/:tutorId")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "Get a verification case by tutor id" })
  @ApiParam({ name: "tutorId", description: "Tutor ID" })
  async getCase(@Param("tutorId") tutorId: string): Promise<{ data: VerificationCaseDto }> {
    return {
      data: await this.getVerificationCaseUseCase.execute({ tutorId }),
    };
  }

  @Post("admin/verifications/:tutorId/approve")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Approve tutor verification and activate the tutor" })
  @ApiParam({ name: "tutorId", description: "Tutor ID" })
  async approve(
    @Req() req: Request,
    @Param("tutorId") tutorId: string,
  ): Promise<{ data: ApproveVerificationResultDto }> {
    const admin = (req as any).user;
    return {
      data: await this.approveVerificationUseCase.execute({
        tutorId,
        reviewerUserId: admin.id,
      }),
    };
  }

  @Post("admin/verifications/:tutorId/reject")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Reject tutor verification" })
  @ApiParam({ name: "tutorId", description: "Tutor ID" })
  async reject(
    @Req() req: Request,
    @Param("tutorId") tutorId: string,
    @Body() dto: RejectVerificationDto,
  ): Promise<{ data: RejectVerificationResultDto }> {
    const admin = (req as any).user;
    return {
      data: await this.rejectVerificationUseCase.execute({
        tutorId,
        reviewerUserId: admin.id,
        rejectionReason: dto.rejectionReason,
      }),
    };
  }

  @Post("admin/verifications/:tutorId/request-changes")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Request changes on a tutor verification" })
  @ApiParam({ name: "tutorId", description: "Tutor ID" })
  async requestChanges(
    @Req() req: Request,
    @Param("tutorId") tutorId: string,
    @Body() dto: RequestChangesDto,
  ): Promise<{ data: RequestChangesResultDto }> {
    const admin = (req as any).user;
    return {
      data: await this.requestChangesVerificationUseCase.execute({
        tutorId,
        reviewerUserId: admin.id,
        note: dto.note ?? null,
      }),
    };
  }
}