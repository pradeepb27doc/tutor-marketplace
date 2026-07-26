import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ListVerificationCasesQueryDto {
  @ApiProperty({
    required: false,
    description: "Cursor for pagination (tutor id from previous page)",
    example: "clx001tutor",
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    required: false,
    description: "Page size (default 20, max 100)",
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
