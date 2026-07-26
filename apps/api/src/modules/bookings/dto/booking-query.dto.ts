import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class BookingQueryDto {
  @ApiPropertyOptional({ description: "Filter by booking status", enum: [
    "REQUESTED", "ACCEPTED", "REJECTED", "CANCELLED_BY_PARENT",
    "CANCELLED_BY_TUTOR", "COMPLETED", "RESCHEDULED", "EXPIRED",
  ]})
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: "Filter bookings from this date (ISO)", example: "2026-07-01T00:00:00.000Z" })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: "Filter bookings until this date (ISO)", example: "2026-07-31T23:59:59.999Z" })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: "Maximum number of results", default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: "Opaque cursor from previous page" })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: "Number of results to skip", default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}