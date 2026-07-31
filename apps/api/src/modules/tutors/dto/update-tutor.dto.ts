import { IsString, IsOptional, IsIn, IsInt, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateTutorDto {
  @ApiPropertyOptional({ description: "Professional headline", example: "Math and Science tutor for grades 3 to 8" })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiPropertyOptional({ description: "Biography", example: "I focus on conceptual clarity and weekly practice." })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: "Gender", example: "FEMALE" })
  @IsOptional()
  @IsIn(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"])
  gender?: string;

  @ApiPropertyOptional({ description: "Years of experience", example: 6 })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ description: "City", example: "Bengaluru" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: "Locality", example: "Indiranagar" })
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiPropertyOptional({ description: "Base hourly rate", example: "600.00" })
  @IsOptional()
  @IsString()
  baseHourlyRate?: string;
}