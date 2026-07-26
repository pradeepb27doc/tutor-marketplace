import { IsString, IsOptional, IsIn, IsInt, Min, Max, Matches } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MODES = ["ONLINE", "HOME_TUITION", "GROUP_CLASS", "WEEKEND_CLASS", "HOLIDAY_CAMP"];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class AddWeeklySlotDto {
  @ApiProperty({ description: "Day of week", enum: DAYS, example: "MONDAY" })
  @IsIn(DAYS)
  dayOfWeek!: string;

  @ApiProperty({ description: "Local start time HH:mm", example: "09:00" })
  @Matches(TIME_RE)
  startTime!: string;

  @ApiProperty({ description: "Local end time HH:mm (must be after start)", example: "11:00" })
  @Matches(TIME_RE)
  endTime!: string;

  @ApiProperty({ description: "Service mode", enum: MODES, example: "ONLINE" })
  @IsIn(MODES)
  serviceMode!: string;

  @ApiPropertyOptional({ description: "IANA timezone", example: "Asia/Kolkata" })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: "Slot capacity", example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  capacity?: number;
}

export class UpdateWeeklySlotDto {
  @ApiPropertyOptional({ description: "Day of week", enum: DAYS, example: "MONDAY" })
  @IsOptional()
  @IsIn(DAYS)
  dayOfWeek?: string;

  @ApiPropertyOptional({ description: "Local start time HH:mm" })
  @IsOptional()
  @Matches(TIME_RE)
  startTime?: string;

  @ApiPropertyOptional({ description: "Local end time HH:mm" })
  @IsOptional()
  @Matches(TIME_RE)
  endTime?: string;

  @ApiPropertyOptional({ description: "Service mode", enum: MODES })
  @IsOptional()
  @IsIn(MODES)
  serviceMode?: string;

  @ApiPropertyOptional({ description: "IANA timezone" })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: "Slot capacity" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  capacity?: number;
}