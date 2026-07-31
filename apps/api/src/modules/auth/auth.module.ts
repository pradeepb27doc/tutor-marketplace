import { Module, Global } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./auth.controller.js";
import { AuthGuard } from "./auth.guard.js";
import type { AuthTokensService } from "@tutor-marketplace/application";
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
import {
  JwtAuthService,
  BcryptPasswordService,
  OtpCodeService,
  LoggingOtpSender,
  SystemClock,
  PrismaUserRepository,
  PrismaUserRoleRepository,
  PrismaSessionRepository,
  PrismaOtpChallengeRepository,
} from "@tutor-marketplace/infrastructure";

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    // Services
    {
      provide: "AuthTokensService",
      useClass: JwtAuthService,
    },
    {
      provide: "PasswordService",
      useClass: BcryptPasswordService,
    },
    {
      provide: "OtpService",
      useClass: OtpCodeService,
    },
    {
      provide: "OtpSender",
      useClass: LoggingOtpSender,
    },
    {
      provide: "Clock",
      useClass: SystemClock,
    },

    // Repositories
    {
      provide: "UserRepository",
      useClass: PrismaUserRepository,
    },
    {
      provide: "UserRoleRepository",
      useClass: PrismaUserRoleRepository,
    },
    {
      provide: "SessionRepository",
      useClass: PrismaSessionRepository,
    },
    {
      provide: "OtpChallengeRepository",
      useClass: PrismaOtpChallengeRepository,
    },

    // Use Cases
    {
      provide: OtpStartUseCase,
      useFactory: (
        otpService: any,
        otpSender: any,
        otpChallengeRepo: any,
        userRepo: any,
        clock: any,
      ) => new OtpStartUseCase(otpService, otpSender, otpChallengeRepo, userRepo, clock),
      inject: ["OtpService", "OtpSender", "OtpChallengeRepository", "UserRepository", "Clock"],
    },
    {
      provide: OtpVerifyUseCase,
      useFactory: (
        otpService: any,
        authTokensService: any,
        otpChallengeRepo: any,
        userRepo: any,
        userRoleRepo: any,
        sessionRepo: any,
        clock: any,
      ) =>
        new OtpVerifyUseCase(
          otpService,
          authTokensService,
          otpChallengeRepo,
          userRepo,
          userRoleRepo,
          sessionRepo,
          clock,
        ),
      inject: [
        "OtpService",
        "AuthTokensService",
        "OtpChallengeRepository",
        "UserRepository",
        "UserRoleRepository",
        "SessionRepository",
        "Clock",
      ],
    },
    {
      provide: LoginUseCase,
      useFactory: (
        passwordService: any,
        authTokensService: any,
        userRepo: any,
        userRoleRepo: any,
        sessionRepo: any,
        clock: any,
      ) =>
        new LoginUseCase(passwordService, authTokensService, userRepo, userRoleRepo, sessionRepo, clock),
      inject: [
        "PasswordService",
        "AuthTokensService",
        "UserRepository",
        "UserRoleRepository",
        "SessionRepository",
        "Clock",
      ],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (
        authTokensService: any,
        sessionRepo: any,
        userRepo: any,
        clock: any,
      ) => new RefreshTokenUseCase(authTokensService, sessionRepo, userRepo, clock),
      inject: ["AuthTokensService", "SessionRepository", "UserRepository", "Clock"],
    },
    {
      provide: LogoutUseCase,
      useFactory: (sessionRepo: any) => new LogoutUseCase(sessionRepo),
      inject: ["SessionRepository"],
    },
    {
      provide: LogoutAllUseCase,
      useFactory: (sessionRepo: any) => new LogoutAllUseCase(sessionRepo),
      inject: ["SessionRepository"],
    },
    {
      provide: GetCurrentUserUseCase,
      useFactory: (userRepo: any, userRoleRepo: any) =>
        new GetCurrentUserUseCase(userRepo, userRoleRepo),
      inject: ["UserRepository", "UserRoleRepository"],
    },
    {
      provide: ListSessionsUseCase,
      useFactory: (sessionRepo: any) => new ListSessionsUseCase(sessionRepo),
      inject: ["SessionRepository"],
    },
    {
      provide: RevokeSessionUseCase,
      useFactory: (sessionRepo: any) => new RevokeSessionUseCase(sessionRepo),
      inject: ["SessionRepository"],
    },

    // Global Guard
    {
      provide: APP_GUARD,
      useFactory: (authTokensService: AuthTokensService, reflector: any) =>
        new AuthGuard(authTokensService, reflector),
      inject: ["AuthTokensService", "Reflector"],
    },
  ],
  exports: [
    "AuthTokensService",
    "PasswordService",
    "OtpService",
    "UserRepository",
    "UserRoleRepository",
    "SessionRepository",
    "OtpChallengeRepository",
    "Clock",
  ],
})
export class AuthModule {}