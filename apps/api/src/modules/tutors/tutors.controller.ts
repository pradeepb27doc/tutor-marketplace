import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse } from "@nestjs/swagger";
import type { Request } from "express";
import { Public } from "../auth/public.decorator.js";
import { Roles } from "../auth/roles.decorator.js";
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
import type { DayOfWeekValue } from "@tutor-marketplace/application";
import { CreateTutorDto } from "./dto/create-tutor.dto.js";
import { UpdateTutorDto } from "./dto/update-tutor.dto.js";
import { AddSubjectDto } from "./dto/add-subject.dto.js";
import { AddQualificationDto, UpdateQualificationDto } from "./dto/add-qualification.dto.js";
import { AddLanguageDto } from "./dto/add-language.dto.js";
import { AddServiceAreaDto } from "./dto/add-service-area.dto.js";
import { AddWeeklySlotDto, UpdateWeeklySlotDto } from "./dto/add-weekly-slot.dto.js";
import { AddBreakPeriodDto } from "./dto/add-break-period.dto.js";
import { AddBlackoutPeriodDto } from "./dto/add-blackout-period.dto.js";
import { GetPublicAvailabilityQueryDto } from "./dto/get-public-availability-query.dto.js";

@ApiTags("Tutors")
@Controller()
export class TutorsController {
  constructor(
    private readonly createTutorProfileUseCase: CreateTutorProfileUseCase,
    private readonly getMyTutorProfileUseCase: GetMyTutorProfileUseCase,
    private readonly getPublicTutorProfileUseCase: GetPublicTutorProfileUseCase,
    private readonly updateTutorProfileUseCase: UpdateTutorProfileUseCase,
    private readonly dashboardUseCase: DashboardUseCase,
    private readonly addTutorSubjectUseCase: AddTutorSubjectUseCase,
    private readonly removeTutorSubjectUseCase: RemoveTutorSubjectUseCase,
    private readonly listTutorSubjectsUseCase: ListTutorSubjectsUseCase,
    private readonly listQualificationsUseCase: ListQualificationsUseCase,
    private readonly addQualificationUseCase: AddQualificationUseCase,
    private readonly updateQualificationUseCase: UpdateQualificationUseCase,
    private readonly removeQualificationUseCase: RemoveQualificationUseCase,
    private readonly listLanguagesUseCase: ListLanguagesUseCase,
    private readonly addLanguageUseCase: AddLanguageUseCase,
    private readonly removeLanguageUseCase: RemoveLanguageUseCase,
    private readonly listServiceAreasUseCase: ListServiceAreasUseCase,
    private readonly addServiceAreaUseCase: AddServiceAreaUseCase,
    private readonly removeServiceAreaUseCase: RemoveServiceAreaUseCase,
    private readonly listWeeklyAvailabilityUseCase: ListWeeklyAvailabilityUseCase,
    private readonly addWeeklySlotUseCase: AddWeeklySlotUseCase,
    private readonly updateWeeklySlotUseCase: UpdateWeeklySlotUseCase,
    private readonly removeWeeklySlotUseCase: RemoveWeeklySlotUseCase,
    private readonly addBreakPeriodUseCase: AddBreakPeriodUseCase,
    private readonly removeBreakPeriodUseCase: RemoveBreakPeriodUseCase,
    private readonly listBlackoutPeriodsUseCase: ListBlackoutPeriodsUseCase,
    private readonly addBlackoutPeriodUseCase: AddBlackoutPeriodUseCase,
    private readonly removeBlackoutPeriodUseCase: RemoveBlackoutPeriodUseCase,
    private readonly getPublicAvailabilityUseCase: GetPublicAvailabilityUseCase,
  ) {}

  // --- Tutor Profile ---

  @Post("tutors/me")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles("USER")
  @ApiOperation({ operationId: "createTutorProfile", summary: "Create a tutor profile for the current user" })
  @ApiCreatedResponse({ description: "Tutor profile created successfully" })
  async createProfile(@Req() req: Request, @Body() dto: CreateTutorDto) {
    const user = (req as any).user;
    return {
      data: await this.createTutorProfileUseCase.execute({ userId: user.id, data: dto }),
    };
  }

  @Get("tutors/me")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "getMyTutorProfile", summary: "Get the current user's tutor profile" })
  @ApiOkResponse({ description: "Tutor profile retrieved successfully" })
  async getMyProfile(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.getMyTutorProfileUseCase.execute({ userId: user.id }),
    };
  }

  @Patch("tutors/me")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "updateTutorProfile", summary: "Update the current user's tutor profile" })
  @ApiOkResponse({ description: "Tutor profile updated successfully" })
  async updateProfile(@Req() req: Request, @Body() dto: UpdateTutorDto) {
    const user = (req as any).user;
    return {
      data: await this.updateTutorProfileUseCase.execute({ userId: user.id, data: dto }),
    };
  }

  @Public()
  @Get("tutors/:tutorId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getPublicTutorProfile", summary: "Get a public tutor profile by ID" })
  @ApiParam({ name: "tutorId", description: "Tutor ID", type: String, example: "tutor_01JABC" })
  @ApiOkResponse({ description: "Public tutor profile retrieved successfully" })
  @ApiNotFoundResponse({ description: "Tutor profile not found" })
  async getPublicProfile(@Param("tutorId") tutorId: string) {
    return {
      data: await this.getPublicTutorProfileUseCase.execute({ tutorId }),
    };
  }

  // --- Dashboard ---

  @Get("tutors/me/dashboard")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "getTutorDashboard", summary: "Get tutor dashboard summary" })
  @ApiOkResponse({ description: "Tutor dashboard summary retrieved successfully" })
  async getDashboard(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.dashboardUseCase.execute({ userId: user.id }),
    };
  }

  @Get("tutors/me/performance")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "getTutorPerformance", summary: "Get tutor performance summary" })
  @ApiOkResponse({ description: "Tutor performance summary retrieved successfully" })
  async getPerformance(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.dashboardUseCase.execute({ userId: user.id }),
    };
  }

  // --- Tutor Subjects ---

  @Get("tutors/me/subjects")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "listTutorSubjects", summary: "List the current tutor's active subjects" })
  @ApiOkResponse({ description: "Tutor subjects retrieved successfully" })
  async listSubjects(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.listTutorSubjectsUseCase.execute({ userId: user.id }),
    };
  }

  @Post("tutors/me/subjects")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "addTutorSubject", summary: "Add a subject to the current tutor's offerings" })
  @ApiCreatedResponse({ description: "Tutor subject added successfully" })
  async addSubject(@Req() req: Request, @Body() dto: AddSubjectDto) {
    const user = (req as any).user;
    return {
      data: await this.addTutorSubjectUseCase.execute({ userId: user.id, data: dto }),
    };
  }

  @Delete("tutors/me/subjects/:tutorSubjectId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "removeTutorSubject", summary: "Remove a subject from the current tutor's offerings" })
  @ApiParam({ name: "tutorSubjectId", description: "Tutor subject ID", type: String, example: "tutor_subject_01JABC" })
  @ApiNoContentResponse({ description: "Tutor subject removed successfully" })
  async removeSubject(
    @Req() req: Request,
    @Param("tutorSubjectId") tutorSubjectId: string,
  ) {
    const user = (req as any).user;
    await this.removeTutorSubjectUseCase.execute({
      userId: user.id,
      tutorSubjectId,
    });
  }

  // --- Qualifications ---

  @Get("tutors/me/qualifications")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "listTutorQualifications", summary: "List the current tutor's qualifications and certifications" })
  @ApiOkResponse({ description: "Tutor qualifications retrieved successfully" })
  async listQualifications(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.listQualificationsUseCase.execute({ userId: user.id }),
    };
  }

  @Post("tutors/me/qualifications")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "addTutorQualification", summary: "Add a qualification or certification" })
  @ApiCreatedResponse({ description: "Tutor qualification added successfully" })
  async addQualification(@Req() req: Request, @Body() dto: AddQualificationDto) {
    const user = (req as any).user;
    return {
      data: await this.addQualificationUseCase.execute({ userId: user.id, data: dto }),
    };
  }

  @Patch("tutors/me/qualifications/:qualificationId")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "updateTutorQualification", summary: "Update a qualification or certification" })
  @ApiParam({ name: "qualificationId", description: "Qualification ID", type: String, example: "qual_01JABC" })
  @ApiOkResponse({ description: "Tutor qualification updated successfully" })
  @ApiNotFoundResponse({ description: "Qualification not found" })
  async updateQualification(
    @Req() req: Request,
    @Param("qualificationId") qualificationId: string,
    @Body() dto: UpdateQualificationDto,
  ) {
    const user = (req as any).user;
    return {
      data: await this.updateQualificationUseCase.execute({
        userId: user.id,
        qualificationId,
        data: dto,
      }),
    };
  }

  @Delete("tutors/me/qualifications/:qualificationId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "removeTutorQualification", summary: "Remove a qualification or certification" })
  @ApiParam({ name: "qualificationId", description: "Qualification ID", type: String, example: "qual_01JABC" })
  @ApiNoContentResponse({ description: "Tutor qualification removed successfully" })
  async removeQualification(
    @Req() req: Request,
    @Param("qualificationId") qualificationId: string,
  ) {
    const user = (req as any).user;
    await this.removeQualificationUseCase.execute({
      userId: user.id,
      qualificationId,
    });
  }

  // --- Languages ---

  @Get("tutors/me/languages")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "listTutorLanguages", summary: "List the current tutor's known languages" })
  @ApiOkResponse({ description: "Tutor languages retrieved successfully" })
  async listLanguages(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.listLanguagesUseCase.execute({ userId: user.id }),
    };
  }

  @Post("tutors/me/languages")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "addTutorLanguage", summary: "Add a language the tutor knows" })
  @ApiCreatedResponse({ description: "Tutor language added successfully" })
  async addLanguage(@Req() req: Request, @Body() dto: AddLanguageDto) {
    const user = (req as any).user;
    return {
      data: await this.addLanguageUseCase.execute({ userId: user.id, data: dto }),
    };
  }

  @Delete("tutors/me/languages/:languageId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "removeTutorLanguage", summary: "Remove a language from the tutor's profile" })
  @ApiParam({ name: "languageId", description: "Language ID", type: String, example: "lang_01JABC" })
  @ApiNoContentResponse({ description: "Tutor language removed successfully" })
  async removeLanguage(
    @Req() req: Request,
    @Param("languageId") languageId: string,
  ) {
    const user = (req as any).user;
    await this.removeLanguageUseCase.execute({
      userId: user.id,
      languageId,
    });
  }

  // --- Service Areas ---

  @Get("tutors/me/service-areas")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "listTutorServiceAreas", summary: "List the current tutor's service areas" })
  @ApiOkResponse({ description: "Tutor service areas retrieved successfully" })
  async listServiceAreas(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.listServiceAreasUseCase.execute({ userId: user.id }),
    };
  }

  @Post("tutors/me/service-areas")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "addTutorServiceArea", summary: "Add a service area the tutor covers" })
  @ApiCreatedResponse({ description: "Tutor service area added successfully" })
  async addServiceArea(@Req() req: Request, @Body() dto: AddServiceAreaDto) {
    const user = (req as any).user;
    return {
      data: await this.addServiceAreaUseCase.execute({ userId: user.id, data: dto }),
    };
  }

  @Delete("tutors/me/service-areas/:serviceAreaId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "removeTutorServiceArea", summary: "Remove a service area from the tutor's coverage" })
  @ApiParam({ name: "serviceAreaId", description: "Service area ID", type: String, example: "sa_01JABC" })
  @ApiNoContentResponse({ description: "Tutor service area removed successfully" })
  async removeServiceArea(
    @Req() req: Request,
    @Param("serviceAreaId") serviceAreaId: string,
  ) {
    const user = (req as any).user;
    await this.removeServiceAreaUseCase.execute({
      userId: user.id,
      serviceAreaId,
    });
  }

  // --- Availability (Milestone 10B) ---

  @Get("tutors/me/availability")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "listTutorWeeklyAvailability", summary: "List the current tutor's weekly slots and break periods" })
  @ApiOkResponse({ description: "Tutor availability retrieved successfully" })
  async listAvailability(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.listWeeklyAvailabilityUseCase.execute({ userId: user.id }),
    };
  }

  @Post("tutors/me/availability/weekly-slots")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "addTutorWeeklySlot", summary: "Add a recurring weekly availability slot" })
  @ApiCreatedResponse({ description: "Weekly slot added successfully" })
  async addWeeklySlot(@Req() req: Request, @Body() dto: AddWeeklySlotDto) {
    const user = (req as any).user;
    return {
      data: await this.addWeeklySlotUseCase.execute({
        userId: user.id,
        data: { ...dto, dayOfWeek: dto.dayOfWeek as DayOfWeekValue },
      }),
    };
  }

  @Patch("tutors/me/availability/weekly-slots/:slotId")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "updateTutorWeeklySlot", summary: "Update a recurring weekly availability slot" })
  @ApiParam({ name: "slotId", description: "Weekly slot ID", type: String, example: "slot_01JABC" })
  @ApiOkResponse({ description: "Weekly slot updated successfully" })
  @ApiNotFoundResponse({ description: "Weekly slot not found" })
  async updateWeeklySlot(
    @Req() req: Request,
    @Param("slotId") slotId: string,
    @Body() dto: UpdateWeeklySlotDto,
  ) {
    const user = (req as any).user;
    return {
      data: await this.updateWeeklySlotUseCase.execute({
        userId: user.id,
        slotId,
        data: { ...dto, dayOfWeek: dto.dayOfWeek as DayOfWeekValue | undefined },
      }),
    };
  }

  @Delete("tutors/me/availability/weekly-slots/:slotId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "removeTutorWeeklySlot", summary: "Remove a recurring weekly availability slot" })
  @ApiParam({ name: "slotId", description: "Weekly slot ID", type: String, example: "slot_01JABC" })
  @ApiNoContentResponse({ description: "Weekly slot removed successfully" })
  @ApiNotFoundResponse({ description: "Weekly slot not found" })
  async removeWeeklySlot(@Req() req: Request, @Param("slotId") slotId: string) {
    const user = (req as any).user;
    await this.removeWeeklySlotUseCase.execute({ userId: user.id, slotId });
  }

  @Post("tutors/me/availability/break-periods")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "addTutorBreakPeriod", summary: "Add a recurring break period" })
  @ApiCreatedResponse({ description: "Break period added successfully" })
  async addBreakPeriod(@Req() req: Request, @Body() dto: AddBreakPeriodDto) {
    const user = (req as any).user;
    return {
      data: await this.addBreakPeriodUseCase.execute({
        userId: user.id,
        data: { ...dto, dayOfWeek: dto.dayOfWeek as DayOfWeekValue | null | undefined },
      }),
    };
  }

  @Delete("tutors/me/availability/break-periods/:breakId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "removeTutorBreakPeriod", summary: "Remove a break period" })
  @ApiParam({ name: "breakId", description: "Break period ID", type: String, example: "break_01JABC" })
  @ApiNoContentResponse({ description: "Break period removed successfully" })
  @ApiNotFoundResponse({ description: "Break period not found" })
  async removeBreakPeriod(@Req() req: Request, @Param("breakId") breakId: string) {
    const user = (req as any).user;
    await this.removeBreakPeriodUseCase.execute({ userId: user.id, breakId });
  }

  @Get("tutors/me/availability/blackout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "listTutorBlackoutPeriods", summary: "List the current tutor's blackout (unavailable) periods" })
  @ApiOkResponse({ description: "Blackout periods retrieved successfully" })
  async listBlackout(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.listBlackoutPeriodsUseCase.execute({ userId: user.id }),
    };
  }

  @Post("tutors/me/availability/blackout")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "addTutorBlackoutPeriod", summary: "Add a blackout (unavailable) period" })
  @ApiCreatedResponse({ description: "Blackout period added successfully" })
  async addBlackout(@Req() req: Request, @Body() dto: AddBlackoutPeriodDto) {
    const user = (req as any).user;
    return {
      data: await this.addBlackoutPeriodUseCase.execute({
        userId: user.id,
        data: {
          startAt: new Date(dto.startAt),
          endAt: new Date(dto.endAt),
          reason: dto.reason,
        },
      }),
    };
  }

  @Delete("tutors/me/availability/blackout/:blackoutId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles("TUTOR")
  @ApiOperation({ operationId: "removeTutorBlackoutPeriod", summary: "Remove a blackout (unavailable) period" })
  @ApiParam({ name: "blackoutId", description: "Blackout period ID", type: String, example: "blackout_01JABC" })
  @ApiNoContentResponse({ description: "Blackout period removed successfully" })
  @ApiNotFoundResponse({ description: "Blackout period not found" })
  async removeBlackout(@Req() req: Request, @Param("blackoutId") blackoutId: string) {
    const user = (req as any).user;
    await this.removeBlackoutPeriodUseCase.execute({ userId: user.id, blackoutId });
  }

  @Public()
  @Get("tutors/:tutorId/availability")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getPublicTutorAvailability", summary: "Get public availability windows for a tutor within a date range" })
  @ApiParam({ name: "tutorId", description: "Tutor ID", type: String, example: "tutor_01JABC" })
  @ApiQuery({ name: "from", required: true, description: "Inclusive range start (ISO 8601 date)", example: "2026-08-01", type: String })
  @ApiQuery({ name: "to", required: true, description: "Inclusive range end (ISO 8601 date)", example: "2026-08-07", type: String })
  @ApiQuery({ name: "timezone", required: false, description: "IANA timezone for output windows (defaults to tutor timezone)", example: "Asia/Kolkata", type: String })
  @ApiOkResponse({ description: "Public availability windows retrieved successfully" })
  @ApiNotFoundResponse({ description: "Tutor not found" })
  async getPublicAvailability(
    @Param("tutorId") tutorId: string,
    @Query() query: GetPublicAvailabilityQueryDto,
  ) {
    return {
      data: await this.getPublicAvailabilityUseCase.execute({
        tutorId,
        from: new Date(query.from),
        to: new Date(query.to),
        timezone: query.timezone,
      }),
    };
  }
}