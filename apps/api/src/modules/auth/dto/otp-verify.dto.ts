import { IsIn, IsString, MinLength } from "class-validator";

export class OtpVerifyDto {
  @IsString()
  @MinLength(1)
  challengeId!: string;

  @IsString()
  @MinLength(1)
  code!: string;

  @IsIn(["PHONE", "EMAIL"])
  channel!: "PHONE" | "EMAIL";
}