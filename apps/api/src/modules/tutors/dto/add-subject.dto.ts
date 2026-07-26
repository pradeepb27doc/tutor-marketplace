import { IsString, IsOptional, IsInt, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddSubjectDto {
  @ApiProperty({ description: "Subject ID or slug", example: "mathematics" })
  @IsString()
  subjectId!: string;

  @ApiPropertyOptional({ description: "Minimum grade", example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  gradeMin?: number;

  @ApiPropertyOptional({ description: "Maximum grade", example: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  gradeMax?: number;

  @ApiPropertyOptional({ description: "Hourly rate for this subject", example: "600.00" })
  @IsOptional()
  @IsString()
  hourlyRate?: string;
}