import { IsOptional, IsString, IsDateString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetPublicAvailabilityQueryDto {
  @ApiProperty({ description: "Inclusive range start (ISO 8601 date)", example: "2026-08-01" })
  @IsDateString()
  from!: string;

  @ApiProperty({ description: "Inclusive range end (ISO 8601 date)", example: "2026-08-07" })
  @IsDateString()
  to!: string;

  @ApiPropertyOptional({
    description: "IANA timezone for output windows (defaults to tutor timezone)",
    example: "Asia/Kolkata",
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}