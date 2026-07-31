import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsIn,
  IsArray,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import type { TutorSortKey, TutorSearchMode } from "@tutor-marketplace/application";

const SORT_VALUES: TutorSortKey[] = [
  "RATING",
  "EXPERIENCE",
  "PRICE_ASC",
  "PRICE_DESC",
  "NEWEST",
  "MOST_BOOKED",
];

const MODE_VALUES = ["ONLINE", "OFFLINE", "HYBRID", "HOME_TUITION", "GROUP_CLASS"] as const;

export class SearchTutorsQueryDto {
  @ApiProperty({ required: false, description: "Filter by subject id" })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiProperty({ required: false, description: "Filter by subject slug" })
  @IsOptional()
  @IsString()
  subjectSlug?: string;

  @ApiProperty({ required: false, description: "Filter by grade (1-12)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  grade?: number;

  @ApiProperty({ required: false, description: "Filter by curricula", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  curricula?: string[];

  @ApiProperty({ required: false, description: "Filter by curriculum" })
  @IsOptional()
  @IsString()
  curriculum?: string;

  @ApiProperty({ required: false, description: "Filter by city" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, description: "Filter by locality (partial match)" })
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiProperty({ required: false, description: "Filter by delivery mode", enum: MODE_VALUES })
  @IsOptional()
  @IsIn(["ONLINE", "OFFLINE", "HYBRID"])
  mode?: TutorSearchMode;

  @ApiProperty({ required: false, description: "Filter by service mode", enum: MODE_VALUES })
  @IsOptional()
  @IsIn(MODE_VALUES)
  serviceMode?: "ONLINE" | "OFFLINE" | "HYBRID" | "HOME_TUITION" | "GROUP_CLASS";

  @ApiProperty({
    required: false,
    description: "Filter by tutor gender",
    enum: ["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"],
  })
  @IsOptional()
  @IsIn(["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"])
  gender?: string;

  @ApiProperty({ required: false, description: "Minimum average rating (0-5)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiProperty({ required: false, description: "Minimum hourly price (INR)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiProperty({ required: false, description: "Maximum hourly price (INR)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @ApiProperty({ required: false, description: "Maximum hourly fee (INR)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxFee?: number;

  @ApiProperty({ required: false, description: "Minimum years of experience" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceMin?: number;

  @ApiProperty({ required: false, description: "Maximum years of experience" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceMax?: number;

  @ApiProperty({ required: false, description: "Only show verified tutors" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verifiedOnly?: boolean;

  @ApiProperty({ required: false, description: "Sort key", enum: SORT_VALUES, default: "RATING" })
  @IsOptional()
  @IsIn(SORT_VALUES)
  sort?: TutorSortKey;

  @ApiProperty({ required: false, description: "Cursor for pagination (tutor id)" })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ required: false, description: "Available from timestamp (ISO 8601)" })
  @IsOptional()
  @IsString()
  availableFrom?: string;

  @ApiProperty({ required: false, description: "Available to timestamp (ISO 8601)" })
  @IsOptional()
  @IsString()
  availableTo?: string;

  @ApiProperty({ required: false, description: "Page size (1-50, default 20)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}