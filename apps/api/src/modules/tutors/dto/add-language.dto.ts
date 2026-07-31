import { IsString, IsOptional, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddLanguageDto {
  @ApiProperty({ description: "Language name", example: "Hindi" })
  @IsString()
  language!: string;

  @ApiPropertyOptional({ description: "Proficiency level", example: "FLUENT", enum: ["BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE"] })
  @IsOptional()
  @IsIn(["BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE"])
  proficiency?: string;
}