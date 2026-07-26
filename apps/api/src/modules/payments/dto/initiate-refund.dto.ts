import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class InitiateRefundDto {
  @ApiProperty({ description: "Booking ID to refund" })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiProperty({ description: "Refund amount in smallest currency unit (e.g. paise)" })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiProperty({ description: "Optional reason for the refund", required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}