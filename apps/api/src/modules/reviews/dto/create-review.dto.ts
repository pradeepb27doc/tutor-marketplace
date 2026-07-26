import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsString, IsOptional, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class CreateReviewDto {
  @ApiProperty({ description: "Student ID" })
  @IsString()
  studentId!: string;

  @ApiProperty({ description: "Rating (1-5)", minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: "Review title" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: "Review comment" })
  @IsOptional()
  @IsString()
  comment?: string;
}