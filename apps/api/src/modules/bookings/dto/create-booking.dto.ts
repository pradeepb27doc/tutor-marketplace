import { IsOptional, IsString, IsObject, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBookingDto {
  @ApiProperty({ description: "Student ID", example: "student_01JABC" })
  @IsString()
  studentId!: string;

  @ApiProperty({ description: "Tutor ID", example: "tutor_01JABC" })
  @IsString()
  tutorId!: string;

  @ApiProperty({ description: "Subject ID", example: "subject_01JABC" })
  @IsString()
  subjectId!: string;

  @ApiPropertyOptional({ description: "TutorSubject ID (optional)", example: "tutor_subject_01JABC" })
  @IsOptional()
  @IsString()
  tutorSubjectId?: string;

  @ApiProperty({ description: "Availability Slot ID to book", example: "slot_01JABC" })
  @IsString()
  availabilitySlotId!: string;

  @ApiPropertyOptional({ description: "City for home tuition" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: "Address details" })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;
}