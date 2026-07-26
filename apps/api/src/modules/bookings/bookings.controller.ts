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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from "@nestjs/swagger";
import type { Request } from "express";
import { Roles } from "../auth/roles.decorator.js";
import { CreateBookingDto } from "./dto/create-booking.dto.js";
import { CancelBookingDto } from "./dto/cancel-booking.dto.js";
import { RescheduleBookingDto } from "./dto/reschedule-booking.dto.js";
import { BookingQueryDto } from "./dto/booking-query.dto.js";
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
import { listResponse, normalizeCursorOffset } from "../../common/api-response.js";

@ApiTags("Bookings")
@ApiBearerAuth()
@Controller()
export class BookingsController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly acceptBookingUseCase: AcceptBookingUseCase,
    private readonly rejectBookingUseCase: RejectBookingUseCase,
    private readonly cancelBookingByParentUseCase: CancelBookingByParentUseCase,
    private readonly cancelBookingByTutorUseCase: CancelBookingByTutorUseCase,
    private readonly rescheduleBookingUseCase: RescheduleBookingUseCase,
    private readonly completeBookingUseCase: CompleteBookingUseCase,
    private readonly getBookingUseCase: GetBookingUseCase,
    private readonly getBookingHistoryUseCase: GetBookingHistoryUseCase,
    private readonly listParentBookingsUseCase: ListParentBookingsUseCase,
    private readonly listTutorBookingsUseCase: ListTutorBookingsUseCase,
  ) {}

  // --- Create Booking ---

  @Post("bookings")
  @HttpCode(HttpStatus.CREATED)
  @Roles("PARENT")
  @ApiOperation({ operationId: "createBooking", summary: "Create a new booking from an available slot" })
  @ApiCreatedResponse({ description: "Booking created successfully" })
  async create(@Req() req: Request, @Body() dto: CreateBookingDto) {
    const user = (req as any).user;
    return {
      data: await this.createBookingUseCase.execute({
        userId: user.id,
        data: dto,
      }),
    };
  }

  // --- Get Booking ---

  @Get("bookings/:bookingId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getBooking", summary: "Get booking details by ID" })
  @ApiParam({ name: "bookingId", description: "Booking ID", example: "booking_01JABC", type: String })
  @ApiOkResponse({ description: "Booking details retrieved successfully" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  async get(@Req() req: Request, @Param("bookingId") bookingId: string) {
    const user = (req as any).user;
    return {
      data: await this.getBookingUseCase.execute({ userId: user.id, bookingId }),
    };
  }

  // --- Get Booking History ---

  @Get("bookings/:bookingId/status-history")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getBookingStatusHistory", summary: "Get booking status history" })
  @ApiParam({ name: "bookingId", description: "Booking ID", example: "booking_01JABC", type: String })
  @ApiOkResponse({ description: "Booking status history retrieved successfully" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  async getHistory(@Req() req: Request, @Param("bookingId") bookingId: string) {
    const user = (req as any).user;
    return {
      data: await this.getBookingHistoryUseCase.execute({ userId: user.id, bookingId }),
    };
  }

  // --- List Parent Bookings ---

  @Get("bookings")
  @HttpCode(HttpStatus.OK)
  @Roles("PARENT")
  @ApiOperation({ operationId: "listParentBookings", summary: "List the current parent's bookings" })
  @ApiOkResponse({ description: "List of parent bookings retrieved successfully" })
  async listParentBookings(@Req() req: Request, @Query() query: BookingQueryDto) {
    const user = (req as any).user;
    const data = await this.listParentBookingsUseCase.execute({
      userId: user.id,
      query: {
        status: query.status,
        from: query.from,
        to: query.to,
        limit: query.limit,
        offset: query.offset ?? normalizeCursorOffset(query.cursor),
      },
    });
    return listResponse(data, { limit: query.limit, cursor: query.cursor });
  }

  // --- List Tutor Bookings ---

  @Get("tutors/me/bookings")
  @HttpCode(HttpStatus.OK)
  @Roles("TUTOR")
  @ApiOperation({ operationId: "listTutorBookings", summary: "List the current tutor's bookings" })
  @ApiOkResponse({ description: "List of tutor bookings retrieved successfully" })
  async listTutorBookings(@Req() req: Request, @Query() query: BookingQueryDto) {
    const user = (req as any).user;
    const data = await this.listTutorBookingsUseCase.execute({
      userId: user.id,
      query: {
        status: query.status,
        from: query.from,
        to: query.to,
        limit: query.limit,
        offset: query.offset ?? normalizeCursorOffset(query.cursor),
      },
    });
    return listResponse(data, { limit: query.limit, cursor: query.cursor });
  }

  // --- Accept Booking (Tutor) ---

  @Post("bookings/:bookingId/accept")
  @HttpCode(HttpStatus.OK)
  @Roles("TUTOR")
  @ApiOperation({ operationId: "acceptBooking", summary: "Accept a pending booking" })
  @ApiParam({ name: "bookingId", description: "Booking ID", example: "booking_01JABC", type: String })
  @ApiOkResponse({ description: "Booking accepted successfully" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  async accept(@Req() req: Request, @Param("bookingId") bookingId: string) {
    const user = (req as any).user;
    return {
      data: await this.acceptBookingUseCase.execute({ userId: user.id, bookingId }),
    };
  }

  // --- Reject Booking (Tutor) ---

  @Post("bookings/:bookingId/reject")
  @HttpCode(HttpStatus.OK)
  @Roles("TUTOR")
  @ApiOperation({ operationId: "rejectBooking", summary: "Reject a pending booking" })
  @ApiParam({ name: "bookingId", description: "Booking ID", example: "booking_01JABC", type: String })
  @ApiOkResponse({ description: "Booking rejected successfully" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  async reject(@Req() req: Request, @Param("bookingId") bookingId: string) {
    const user = (req as any).user;
    return {
      data: await this.rejectBookingUseCase.execute({ userId: user.id, bookingId }),
    };
  }

  // --- Cancel Booking (Parent) ---

  @Post("bookings/:bookingId/cancel")
  @HttpCode(HttpStatus.OK)
  @Roles("PARENT", "TUTOR")
  @ApiOperation({ operationId: "cancelBooking", summary: "Cancel a booking" })
  @ApiParam({ name: "bookingId", description: "Booking ID", example: "booking_01JABC", type: String })
  @ApiOkResponse({ description: "Booking cancelled successfully" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  async cancelByParent(
    @Req() req: Request,
    @Param("bookingId") bookingId: string,
    @Body() dto: CancelBookingDto,
  ) {
    const user = (req as any).user;
    const role = (user.role as string | undefined) ?? "PARENT";
    const data = role === "TUTOR"
      ? await this.cancelBookingByTutorUseCase.execute({
        userId: user.id,
        bookingId,
        reason: dto.reason,
      })
      : await this.cancelBookingByParentUseCase.execute({
        userId: user.id,
        bookingId,
        reason: dto.reason,
      });
    return { data };
  }

  // --- Start Booking (Tutor) ---

  @Post("bookings/:bookingId/start")
  @HttpCode(HttpStatus.OK)
  @Roles("TUTOR")
  @ApiOperation({ operationId: "startBooking", summary: "Mark a booking as in progress" })
  @ApiParam({ name: "bookingId", description: "Booking ID", example: "booking_01JABC", type: String })
  @ApiOkResponse({ description: "Booking started successfully" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  async start(@Req() req: Request, @Param("bookingId") bookingId: string) {
    const user = (req as any).user;
    return {
      data: await this.acceptBookingUseCase.execute({ userId: user.id, bookingId }),
    };
  }

  // --- Reschedule Booking (Parent) ---

  @Post("bookings/:bookingId/reschedule")
  @HttpCode(HttpStatus.OK)
  @Roles("PARENT")
  @ApiOperation({ operationId: "rescheduleBooking", summary: "Reschedule a booking to a new slot" })
  @ApiParam({ name: "bookingId", description: "Booking ID", example: "booking_01JABC", type: String })
  @ApiOkResponse({ description: "Booking rescheduled successfully" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  async reschedule(
    @Req() req: Request,
    @Param("bookingId") bookingId: string,
    @Body() dto: RescheduleBookingDto,
  ) {
    const user = (req as any).user;
    return {
      data: await this.rescheduleBookingUseCase.execute({
        userId: user.id,
        bookingId,
        data: { newAvailabilitySlotId: dto.newAvailabilitySlotId, reason: dto.reason },
      }),
    };
  }

  // --- Complete Booking (Tutor) ---

  @Post("bookings/:bookingId/complete")
  @HttpCode(HttpStatus.OK)
  @Roles("TUTOR")
  @ApiOperation({ operationId: "completeBooking", summary: "Mark a booking as completed" })
  @ApiParam({ name: "bookingId", description: "Booking ID", example: "booking_01JABC", type: String })
  @ApiOkResponse({ description: "Booking completed successfully" })
  @ApiNotFoundResponse({ description: "Booking not found" })
  async complete(@Req() req: Request, @Param("bookingId") bookingId: string) {
    const user = (req as any).user;
    return {
      data: await this.completeBookingUseCase.execute({ userId: user.id, bookingId }),
    };
  }
}