import { IsString, IsOptional, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UploadVerificationDocumentDto {
  @ApiProperty({
    description: "Storage key of the finalized uploaded document (no raw file content)",
    example: "kyc/GOVERNMENT_ID/abc123.pdf",
  })
  @IsString()
  fileKey!: string;

  @ApiProperty({
    required: false,
    description: "Original file name",
    example: "aadhaar.pdf",
  })
  @IsOptional()
  @IsString()
  originalFileName?: string;

  @ApiProperty({
    required: false,
    description: "MIME type of the file",
    example: "application/pdf",
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({
    required: false,
    description: "ISO date when the document expires (if applicable)",
    example: "2030-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}