import { IsOptional, IsString, MinLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateParentDto {
  @ApiPropertyOptional({ description: "City of residence", example: "Bengaluru" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  city?: string;

  @ApiPropertyOptional({ description: "Preferred language", example: "en" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  preferredLanguage?: string;
}