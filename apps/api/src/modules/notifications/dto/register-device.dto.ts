import { IsOptional, IsString, IsNotEmpty, IsIn, IsBoolean } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDeviceDto {
  @ApiProperty({ description: "Device platform (e.g. ios, android, web)" })
  @IsString()
  @IsNotEmpty()
  platform!: string;

  @ApiProperty({ description: "Push notification token" })
  @IsString()
  @IsNotEmpty()
  pushToken!: string;
}

export class UpdatePreferenceDto {
  @ApiProperty({ description: "Notification channel", enum: ["PUSH", "EMAIL", "SMS", "WHATSAPP", "IN_APP"] })
  @IsString()
  @IsNotEmpty()
  @IsIn(["PUSH", "EMAIL", "SMS", "WHATSAPP", "IN_APP"])
  channel!: string;

  @ApiProperty({ description: "Notification category" })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ description: "Whether the preference is enabled" })
  @Type(() => Boolean)
  enabled!: boolean;
}

export class NotificationQueryDto {
  @ApiPropertyOptional({ description: "Number of results per page" })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: "Number of results to skip" })
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({ description: "Opaque cursor from previous page" })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: "Filter unread notifications only" })
  @IsOptional()
  @Type(() => Boolean)
  unreadOnly?: boolean;
}