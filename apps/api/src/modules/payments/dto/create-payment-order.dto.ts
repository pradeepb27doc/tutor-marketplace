import { IsOptional, IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentOrderDto {
  @ApiProperty({ description: "Booking ID to pay for" })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({
    description: "Payment provider (e.g. RAZORPAY, STRIPE, MANUAL)",
    required: false,
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ description: "Idempotency key to prevent duplicate orders", required: false })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
