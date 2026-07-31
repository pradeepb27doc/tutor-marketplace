import { IsDateString, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddBlackoutPeriodDto {
  @ApiProperty({ description: "Unavailable start (ISO 8601)", example: "2026-12-25T00:00:00.000Z" })
  @IsDateString()
  startAt!: string;

  @ApiProperty({ description: "Unavailable end (ISO 8601, after start)", example: "2026-12-26T00:00:00.000Z" })
  @IsDateString()
  endAt!: string;

  @ApiPropertyOptional({ description: "Reason", example: "Winter holidays" })
  @IsOptional()
  @IsString()
  reason?: string;
}