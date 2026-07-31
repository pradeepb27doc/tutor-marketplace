import { IsString, IsOptional, IsInt, Min, IsNumberString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddServiceAreaDto {
  @ApiProperty({ description: "City", example: "Bengaluru" })
  @IsString()
  city!: string;

  @ApiPropertyOptional({ description: "Locality", example: "Indiranagar" })
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiPropertyOptional({ description: "Service radius in km", example: "10" })
  @IsOptional()
  @IsNumberString()
  radiusKm?: string;
}
