import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubjectParamDto {
  @ApiProperty({ description: "Subject slug", example: "mathematics" })
  @IsString()
  subjectSlug!: string;
}