import { IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdminSuspendDto {
  @ApiProperty({ required: false, description: "Reason for the action" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}