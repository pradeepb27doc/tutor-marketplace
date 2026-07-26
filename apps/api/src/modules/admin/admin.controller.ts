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
  type AdminUserListDto,
  type AdminTutorListDto,
  type AdminBookingListDto,
  type AdminPaymentListDto,
  type AdminRefundListDto,
  type AdminAuditLogListDto,
  type AdminOverview,
} from "@tutor-marketplace/application";
import { AdminSuspendDto } from "./dto/admin-suspend.dto.js";

@ApiTags("Admin & Moderation")
@ApiBearerAuth()
@Controller("admin")
export class AdminController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly suspendUserUseCase: SuspendUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly listTutorsUseCase: ListTutorsUseCase,
    private readonly listBookingsUseCase: ListBookingsUseCase,
    private readonly getBookingUseCase: AdminGetBookingUseCase,
    private readonly cancelBookingUseCase: AdminCancelBookingUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly listRefundsUseCase: AdminListRefundsUseCase,
    private readonly getOverviewUseCase: GetAdminOverviewUseCase,
    private readonly listAuditLogsUseCase: ListAuditLogsUseCase,
  ) {}

  @Get("overview")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "Operational dashboard overview" })
  async getOverview(@Req() req: Request): Promise<{ data: AdminOverview }> {
    const actor = (req as any).user;
    return { data: await this.getOverviewUseCase.execute({ actorUserId: actor.id }) };
  }

  @Get("users")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "List users" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by user status" })
  @ApiQuery({ name: "role", required: false, type: String, description: "Filter by role" })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search query" })
  async listUsers(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @Query("status") status?: string,
    @Query("role") role?: string,
    @Query("search") search?: string,
  ): Promise<{ data: AdminUserListDto["data"]; page: AdminUserListDto["page"] }> {
    const actor = (req as any).user;
    const result = await this.listUsersUseCase.execute({
      actorUserId: actor.id,
      query: { cursor: cursor ?? null, limit, status, role, search },
    });
    return { data: result.data, page: result.page };
  }

  @Get("users/:userId")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "User detail" })
  @ApiParam({ name: "userId", description: "User ID" })
  async getUser(
    @Req() req: Request,
    @Param("userId") userId: string,
  ): Promise<{ data: any }> {
    const actor = (req as any).user;
    return { data: await this.getUserUseCase.execute({ actorUserId: actor.id, userId }) };
  }

  @Post("users/:userId/suspend")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Suspend account" })
  @ApiParam({ name: "userId", description: "User ID" })
  async suspendUser(
    @Req() req: Request,
    @Param("userId") userId: string,
    @Body() dto: AdminSuspendDto,
  ): Promise<{ data: any }> {
    const actor = (req as any).user;
    return {
      data: await this.suspendUserUseCase.execute({
        actorUserId: actor.id,
        userId,
        reason: dto.reason,
      }),
    };
  }

  @Post("users/:userId/activate")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Activate account" })
  @ApiParam({ name: "userId", description: "User ID" })
  async activateUser(
    @Req() req: Request,
    @Param("userId") userId: string,
  ): Promise<{ data: any }> {
    const actor = (req as any).user;
    return { data: await this.activateUserUseCase.execute({ actorUserId: actor.id, userId }) };
  }

  @Get("tutors")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "List tutors" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by tutor status" })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search query" })
  async listTutors(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @Query("status") status?: string,
    @Query("search") search?: string,
  ): Promise<{ data: AdminTutorListDto["data"]; page: AdminTutorListDto["page"] }> {
    const actor = (req as any).user;
    const result = await this.listTutorsUseCase.execute({
      actorUserId: actor.id,
      query: { cursor: cursor ?? null, limit, status, search },
    });
    return { data: result.data, page: result.page };
  }

  @Get("bookings")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "List bookings" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by booking status" })
  async listBookings(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @Query("status") status?: string,
  ): Promise<{ data: AdminBookingListDto["data"]; page: AdminBookingListDto["page"] }> {
    const actor = (req as any).user;
    const result = await this.listBookingsUseCase.execute({
      actorUserId: actor.id,
      query: { cursor: cursor ?? null, limit, status },
    });
    return { data: result.data, page: result.page };
  }

  @Get("bookings/:bookingId")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SUPPORT")
  @ApiOperation({ summary: "Booking detail" })
  @ApiParam({ name: "bookingId", description: "Booking ID" })
  async getBooking(
    @Req() req: Request,
    @Param("bookingId") bookingId: string,
  ): Promise<{ data: any }> {
    const actor = (req as any).user;
    return { data: await this.getBookingUseCase.execute({ actorUserId: actor.id, bookingId }) };
  }

  @Post("bookings/:bookingId/cancel")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Admin cancellation of a booking" })
  @ApiParam({ name: "bookingId", description: "Booking ID" })
  async cancelBooking(
    @Req() req: Request,
    @Param("bookingId") bookingId: string,
    @Body() dto: AdminSuspendDto,
  ): Promise<{ data: any }> {
    const actor = (req as any).user;
    return {
      data: await this.cancelBookingUseCase.execute({
        actorUserId: actor.id,
        bookingId,
        reason: dto.reason,
      }),
    };
  }

  @Get("payments")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "FINANCE")
  @ApiOperation({ summary: "Payment list" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by payment status" })
  async listPayments(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @Query("status") status?: string,
  ): Promise<{ data: AdminPaymentListDto["data"]; page: AdminPaymentListDto["page"] }> {
    const actor = (req as any).user;
    const result = await this.listPaymentsUseCase.execute({
      actorUserId: actor.id,
      query: { cursor: cursor ?? null, limit, status },
    });
    return { data: result.data, page: result.page };
  }

  @Get("refunds")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "FINANCE")
  @ApiOperation({ summary: "Refund list" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by refund status" })
  async listRefunds(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @Query("status") status?: string,
  ): Promise<{ data: AdminRefundListDto["data"]; page: AdminRefundListDto["page"] }> {
    const actor = (req as any).user;
    const result = await this.listRefundsUseCase.execute({
      actorUserId: actor.id,
      query: { cursor: cursor ?? null, limit, status },
    });
    return { data: result.data, page: result.page };
  }

  @Get("audit-logs")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Audit logs" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "entityType", required: false, type: String, description: "Filter by entity type" })
  @ApiQuery({ name: "action", required: false, type: String, description: "Filter by action" })
  async listAuditLogs(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @Query("entityType") entityType?: string,
    @Query("action") action?: string,
  ): Promise<{ data: AdminAuditLogListDto["data"]; page: AdminAuditLogListDto["page"] }> {
    const actor = (req as any).user;
    const result = await this.listAuditLogsUseCase.execute({
      actorUserId: actor.id,
      query: { cursor: cursor ?? null, limit, entityType, action },
    });
    return { data: result.data, page: result.page };
  }
}