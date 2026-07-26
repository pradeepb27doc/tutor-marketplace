import { IsString, IsOptional, IsIn, Matches } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class AddBreakPeriodDto {
  @ApiPropertyOptional({
    description: "Day of week (omit for all days)",
    enum: DAYS,
    example: "MONDAY",
  })
  @IsOptional()
  @IsIn(DAYS)
  dayOfWeek?: string;

  @ApiProperty({ description: "Local start time HH:mm", example: "12:00" })
  @Matches(TIME_RE)
  startTime!: string;

  @ApiProperty({ description: "Local end time HH:mm (must be after start)", example: "13:00" })
  @Matches(TIME_RE)
  endTime!: string;

  @ApiPropertyOptional({ description: "Reason", example: "Lunch" })
  @IsOptional()
  @IsString()
  reason?: string;
}