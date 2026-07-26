import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class PaymentQueryDto {
  @ApiProperty({ description: "Filter by payment status", required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: "Filter by provider", required: false })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ description: "Created from (ISO date)", required: false })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiProperty({ description: "Created to (ISO date)", required: false })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiProperty({ description: "Limit", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ description: "Opaque cursor from previous page", required: false })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ description: "Offset", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number;
}

export class RefundQueryDto {
  @ApiProperty({ description: "Filter by status", required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: "Filter by payment ID", required: false })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiProperty({ description: "Filter by booking ID", required: false })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiProperty({ description: "Limit", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ description: "Opaque cursor from previous page", required: false })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ description: "Offset", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number;
}