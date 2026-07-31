import { IsString, IsOptional, IsInt, Min, Max } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddQualificationDto {
  @ApiProperty({ description: "Qualification or certification title", example: "B.Sc. Mathematics" })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: "Institution name", example: "University of Delhi" })
  @IsOptional()
  @IsString()
  institutionName?: string;

  @ApiPropertyOptional({ description: "Year of completion", example: 2018 })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  completionYear?: number;
}

export class UpdateQualificationDto {
  @ApiPropertyOptional({ description: "Qualification or certification title", example: "B.Sc. Mathematics" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: "Institution name", example: "University of Delhi" })
  @IsOptional()
  @IsString()
  institutionName?: string;

  @ApiPropertyOptional({ description: "Year of completion", example: 2018 })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  completionYear?: number;
}