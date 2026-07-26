import { IsString, IsOptional, IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RejectVerificationDto {
  @ApiProperty({
    description: "Reason for rejecting the tutor verification",
    example: "Degree certificate is illegible. Please re-upload a clear scan.",
  })
  @IsString()
  @IsNotEmpty()
  rejectionReason!: string;
}

export class RequestChangesDto {
  @ApiPropertyOptional({
    description: "Optional note describing the changes the tutor must make",
    example: "Address proof does not match the profile city.",
  })
  @IsOptional()
  @IsString()
  note?: string;
}
