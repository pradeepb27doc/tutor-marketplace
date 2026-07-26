import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsIn } from "class-validator";

export class ModerateReviewDto {
  @ApiProperty({ description: "Review moderation status", enum: ["PUBLISHED", "HIDDEN", "FLAGGED"] })
  @IsString()
  @IsIn(["PUBLISHED", "HIDDEN", "FLAGGED"])
  status!: "PUBLISHED" | "HIDDEN" | "FLAGGED";
}