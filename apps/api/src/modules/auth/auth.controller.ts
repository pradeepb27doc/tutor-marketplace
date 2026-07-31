import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { Public } from "./public.decorator.js";
import { OtpStartDto } from "./dto/otp-start.dto.js";
import { OtpVerifyDto } from "./dto/otp-verify.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshTokenDto } from "./dto/refresh-token.dto.js";
import {
  OtpStartUseCase,
  OtpVerifyUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  LogoutAllUseCase,
  GetCurrentUserUseCase,
  ListSessionsUseCase,
  RevokeSessionUseCase,
} from "@tutor-marketplace/application";

@Controller({ version: "1" })
export class AuthController {
  constructor(
    private readonly otpStartUseCase: OtpStartUseCase,
    private readonly otpVerifyUseCase: OtpVerifyUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logoutAllUseCase: LogoutAllUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly listSessionsUseCase: ListSessionsUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
  ) {}

  @Public()
  @Post("auth/otp/start")
  @HttpCode(HttpStatus.OK)
  async startOtp(@Body() dto: OtpStartDto) {
    return {
      data: await this.otpStartUseCase.execute({
        channel: dto.channel,
        destination: (dto.destination ?? dto.phone ?? dto.email) as string,
        purpose: dto.purpose,
      }),
    };
  }

  @Public()
  @Post("auth/otp/verify")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: OtpVerifyDto) {
    return {
      data: await this.otpVerifyUseCase.execute({
        challengeId: dto.challengeId,
        code: dto.code,
        channel: dto.channel,
      }),
    };
  }

  @Public()
  @Post("auth/login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return {
      data: await this.loginUseCase.execute({
        email: dto.email,
        password: dto.password,
      }),
    };
  }

  @Public()
  @Post("auth/refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return {
      data: await this.refreshTokenUseCase.execute({
        refreshToken: dto.refreshToken,
      }),
    };
  }

  @Post("auth/logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request) {
    const user = (req as any).user;
    // Extract session ID from request (could be from a custom header or token)
    const sessionId = req.headers["x-session-id"] as string;
    if (sessionId) {
      await this.logoutUseCase.execute({
        userId: user.id,
        sessionId,
      });
    }
  }

  @Post("auth/logout-all")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@Req() req: Request) {
    const user = (req as any).user;
    await this.logoutAllUseCase.execute({ userId: user.id });
  }

  @Get("me")
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.getCurrentUserUseCase.execute({ userId: user.id }),
    };
  }

  @Get("me/sessions")
  @HttpCode(HttpStatus.OK)
  async listSessions(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.listSessionsUseCase.execute({ userId: user.id }),
    };
  }

  @Delete("me/sessions/:sessionId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(
    @Req() req: Request,
    @Param("sessionId") sessionId: string,
  ) {
    const user = (req as any).user;
    await this.revokeSessionUseCase.execute({
      userId: user.id,
      sessionId,
    });
  }
}