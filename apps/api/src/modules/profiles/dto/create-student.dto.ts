import { IsString, IsOptional, IsIn, IsInt, Min, MinLength, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateStudentDto {
  @ApiProperty({ description: "Full name of the student", example: "Aarav Sharma" })
  @IsString()
  @MinLength(1)
  fullName!: string;

  @ApiPropertyOptional({ description: "Date of birth (ISO 8601)", example: "2016-08-14" })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: "Gender", example: "MALE" })
  @IsOptional()
  @IsIn(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"])
  gender?: string;

  @ApiPropertyOptional({ description: "Grade level", example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  grade?: number;

  @ApiPropertyOptional({ description: "Curriculum", example: "CBSE" })
  @IsOptional()
  @IsIn(["CBSE", "ICSE", "IGCSE", "IB", "STATE_BOARD", "OTHER"])
  curriculum?: string;

  @ApiPropertyOptional({ description: "School name", example: "National Public School" })
  @IsOptional()
  @IsString()
  schoolName?: string;

  @ApiPropertyOptional({ description: "Learning goals or notes", example: "Needs help with mathematics problem solving." })
  @IsOptional()
  @IsString()
  learningGoals?: string;
}