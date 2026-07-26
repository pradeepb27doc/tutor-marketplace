import { IsOptional, IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyPaymentDto {
  @ApiProperty({ description: "Gateway provider", required: false })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ description: "Gateway provider order ID" })
  @IsString()
  @IsNotEmpty()
  providerOrderId!: string;

  @ApiProperty({ description: "Gateway provider payment ID" })
  @IsString()
  @IsNotEmpty()
  providerPaymentId!: string;

  @ApiProperty({ description: "Gateway HMAC signature" })
  @IsString()
  @IsNotEmpty()
  signature!: string;
}