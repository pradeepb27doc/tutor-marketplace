import { IsIn, IsOptional, IsString, MinLength, ValidateIf } from "class-validator";

export class OtpStartDto {
  @IsIn(["PHONE", "EMAIL"])
  channel!: "PHONE" | "EMAIL";

  @ValidateIf((dto: OtpStartDto) => dto.phone === undefined && dto.email === undefined)
  @IsString()
  @MinLength(1)
  destination?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  email?: string;

  @IsIn(["LOGIN", "SIGNUP", "PHONE_VERIFICATION", "EMAIL_VERIFICATION", "PASSWORD_RESET"])
  purpose!: "LOGIN" | "SIGNUP" | "PHONE_VERIFICATION" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";
}