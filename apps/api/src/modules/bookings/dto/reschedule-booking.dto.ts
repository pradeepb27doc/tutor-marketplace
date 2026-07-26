import { IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RescheduleBookingDto {
  @ApiProperty({ description: "New Availability Slot ID", example: "slot_01JABC" })
  @IsString()
  newAvailabilitySlotId!: string;

  @ApiPropertyOptional({ description: "Reason for rescheduling", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}