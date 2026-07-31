import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import type { Request } from "express";
import {
  ListUserNotificationsUseCase,
  MarkNotificationReadUseCase,
  GetUserNotificationPreferencesUseCase,
  UpdateNotificationPreferenceUseCase,
  RegisterDeviceTokenUseCase,
} from "@tutor-marketplace/application";
import { listResponse, normalizeCursorOffset } from "../../common/api-response.js";
import {
  RegisterDeviceDto,
  UpdatePreferenceDto,
  NotificationQueryDto,
} from "./dto/register-device.dto.js";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller()
export class NotificationsController {
  constructor(
    private readonly listNotificationsUseCase: ListUserNotificationsUseCase,
    private readonly markReadUseCase: MarkNotificationReadUseCase,
    private readonly getPreferencesUseCase: GetUserNotificationPreferencesUseCase,
    private readonly updatePreferenceUseCase: UpdateNotificationPreferenceUseCase,
    private readonly registerDeviceUseCase: RegisterDeviceTokenUseCase,
  ) {}

  // --- Register Device (User) ---

  @Post("devices")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a push token for the current user's device" })
  async registerDevice(@Req() req: Request, @Body() dto: RegisterDeviceDto) {
    const user = (req as any).user;
    await this.registerDeviceUseCase.execute({
      userId: user.id,
      platform: dto.platform,
      pushToken: dto.pushToken,
    });
    return { data: { registered: true } };
  }

  // --- Update Device (User) ---

  @Patch("devices/:deviceId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update push token/device metadata" })
  @ApiParam({ name: "deviceId", description: "Device ID" })
  async updateDevice(
    @Req() req: Request,
    @Param("deviceId") deviceId: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    const user = (req as any).user;
    await this.registerDeviceUseCase.execute({
      userId: user.id,
      platform: dto.platform,
      pushToken: dto.pushToken,
    });
    return { data: { updated: true } };
  }

  // --- Remove Device (User) ---

  @Delete("devices/:deviceId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a push token / unregister device" })
  @ApiParam({ name: "deviceId", description: "Device ID" })
  async removeDevice(
    @Req() req: Request,
    @Param("deviceId") deviceId: string,
  ) {
    const user = (req as any).user;
    // The use case for removing a device token is handled at the repository level.
    // For now, this endpoint is defined per spec but delegates to a no-op or future use case.
    return;
  }

  // --- List Notifications (User) ---

  @Get("notifications")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List the current user's notifications" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  @ApiQuery({ name: "unreadOnly", required: false, type: Boolean, description: "Filter unread only" })
  async list(@Req() req: Request, @Query() query: NotificationQueryDto) {
    const user = (req as any).user;
    const result = await this.listNotificationsUseCase.execute({
      userId: user.id,
      limit: query.limit,
      offset: query.offset ?? normalizeCursorOffset(query.cursor),
      unreadOnly: query.unreadOnly,
    });
    return listResponse(result.items, { limit: query.limit, cursor: query.cursor });
  }

  // --- Mark Notification Read (User) ---

  @Patch("notifications/:id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiParam({ name: "id", description: "Notification ID" })
  async markRead(@Req() req: Request, @Param("id") id: string) {
    const user = (req as any).user;
    await this.markReadUseCase.execute({ userId: user.id, notificationId: id });
    return { data: { marked: true } };
  }

  // --- Get Notification Preferences (User) ---

  @Get("me/preferences")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the current user's notification preferences" })
  async getPreferences(@Req() req: Request) {
    const user = (req as any).user;
    const prefs = await this.getPreferencesUseCase.execute({ userId: user.id });
    return { data: prefs };
  }

  // --- Update Notification Preferences (User) ---

  @Patch("me/preferences")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a notification preference for the current user" })
  async updatePreference(@Req() req: Request, @Body() dto: UpdatePreferenceDto) {
    const user = (req as any).user;
    const pref = await this.updatePreferenceUseCase.execute({
      userId: user.id,
      channel: dto.channel,
      category: dto.category,
      enabled: dto.enabled,
    });
    return { data: pref };
  }
}