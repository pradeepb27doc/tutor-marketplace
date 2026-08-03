import "reflect-metadata";
import { vi } from "vitest";
import { INestApplication, ValidationPipe, VersioningType, Logger, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Reflector, APP_GUARD } from "@nestjs/core";
import { ApiHttpExceptionFilter } from "../src/common/http-exception.filter.js";
import { requestIdMiddleware } from "../src/common/request-id.middleware.js";
import { RedisCache } from "@tutor-marketplace/infrastructure";
import { HealthController } from "../src/health/health.controller.js";
import { AuthController } from "../src/modules/auth/auth.controller.js";
import { AuthGuard } from "../src/modules/auth/auth.guard.js";
import { SearchController } from "../src/modules/search/search.controller.js";
import { BookingsController } from "../src/modules/bookings/bookings.controller.js";
import { PaymentsController } from "../src/modules/payments/payments.controller.js";
import { AdminController } from "../src/modules/admin/admin.controller.js";
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
  SearchTutorsUseCase,
  GetPublicTutorDetailUseCase,
  CreateBookingUseCase,
  AcceptBookingUseCase,
  RejectBookingUseCase,
  CancelBookingByParentUseCase,
  CancelBookingByTutorUseCase,
  RescheduleBookingUseCase,
  CompleteBookingUseCase,
  GetBookingUseCase,
  GetBookingHistoryUseCase,
  ListParentBookingsUseCase,
  ListTutorBookingsUseCase,
  CreatePaymentOrderUseCase,
  VerifyPaymentUseCase,
  CapturePaymentUseCase,
  RetryPaymentUseCase,
  InitiateRefundUseCase,
  ApproveRefundUseCase,
  RejectRefundUseCase,
  GetPaymentUseCase,
  ListParentPaymentsUseCase,
  ListAllPaymentsUseCase,
  GetPaymentHistoryUseCase,
  GetRefundStatusUseCase,
  ListRefundsUseCase,
  ProcessPaymentWebhookUseCase,
  GetPaymentSummaryUseCase,
  CancelPaymentUseCase,
  ListUsersUseCase,
  GetUserUseCase,
  SuspendUserUseCase,
  ActivateUserUseCase,
  ListTutorsUseCase,
  ListBookingsUseCase,
  AdminGetBookingUseCase,
  AdminCancelBookingUseCase,
  ListPaymentsUseCase,
  AdminListRefundsUseCase,
  GetAdminOverviewUseCase,
  ListAuditLogsUseCase,
} from "@tutor-marketplace/application";
import type { AuthTokensService, TokenPayload } from "@tutor-marketplace/application";

// Silence NestJS logger during tests
Logger.overrideLogger([]);

/** Returns a mock use-case object with a vi.fn() execute method. */
function mockUseCase() {
  return { execute: vi.fn() };
}

/** Returns a mock use-case that resolves to an empty list (for list endpoints). */
function mockListUseCase() {
  return { execute: vi.fn().mockResolvedValue([]) };
}

/** Returns a mock use-case that resolves to a search result shape (for search endpoints). */
function mockSearchUseCase() {
  return { execute: vi.fn().mockResolvedValue({ data: [], nextCursor: null }) };
}

/** Returns a mock use-case that resolves to a generic object (for detail endpoints). */
function mockDetailUseCase() {
  return {
    execute: vi.fn().mockImplementation(({ tutorId }: { tutorId: string }) => {
      if (tutorId === "non-existent") {
        return Promise.reject(new NotFoundException("Tutor not found"));
      }
      return Promise.resolve({ id: "mock-1" });
    }),
  };
}

/** Creates a mock AuthTokensService that always verifies successfully. */
export function createMockAuthTokensService(payload: TokenPayload = { sub: "test-user", role: "PARENT" }): AuthTokensService {
  return {
    verifyAccessToken: vi.fn().mockResolvedValue(payload),
    generateTokenPair: vi.fn(),
    hashRefreshToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
  };
}

let authTokensService: ReturnType<typeof createMockAuthTokensService>;

export function getAuthTokensService() {
  return authTokensService;
}

/**
 * Builds a minimal NestJS testing application containing the public-facing
 * controllers (Health, Auth, Search) plus the protected ones (Bookings,
 * Payments, Admin).  All use-case dependencies are replaced with vi.fn() mocks.
 *
 * The AuthGuard is wired as the global guard so that authorization headers
 * are exercised end-to-end via supertest.
 */
export async function createSmokeTestApp(): Promise<INestApplication> {
  authTokensService = createMockAuthTokensService();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [
      HealthController,
      AuthController,
      SearchController,
      BookingsController,
      PaymentsController,
      AdminController,
    ],
    providers: [
      { provide: APP_GUARD, useFactory: (tokens: AuthTokensService, reflector: Reflector) => new AuthGuard(tokens, reflector), inject: ["AuthTokensService", Reflector] },
      { provide: "AuthTokensService", useValue: authTokensService },
      { provide: Reflector, useValue: new Reflector() },
      { provide: RedisCache, useValue: { getOrSet: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()) } },
      { provide: OtpStartUseCase, useValue: mockUseCase() },
      { provide: OtpVerifyUseCase, useValue: mockUseCase() },
      { provide: LoginUseCase, useValue: mockUseCase() },
      { provide: RefreshTokenUseCase, useValue: mockUseCase() },
      { provide: LogoutUseCase, useValue: mockUseCase() },
      { provide: LogoutAllUseCase, useValue: mockUseCase() },
      { provide: GetCurrentUserUseCase, useValue: mockUseCase() },
      { provide: ListSessionsUseCase, useValue: mockUseCase() },
      { provide: RevokeSessionUseCase, useValue: mockUseCase() },
      { provide: SearchTutorsUseCase, useValue: mockSearchUseCase() },
      { provide: GetPublicTutorDetailUseCase, useValue: mockDetailUseCase() },
      { provide: CreateBookingUseCase, useValue: mockUseCase() },
      { provide: AcceptBookingUseCase, useValue: mockUseCase() },
      { provide: RejectBookingUseCase, useValue: mockUseCase() },
      { provide: CancelBookingByParentUseCase, useValue: mockUseCase() },
      { provide: CancelBookingByTutorUseCase, useValue: mockUseCase() },
      { provide: RescheduleBookingUseCase, useValue: mockUseCase() },
      { provide: CompleteBookingUseCase, useValue: mockUseCase() },
      { provide: GetBookingUseCase, useValue: mockUseCase() },
      { provide: GetBookingHistoryUseCase, useValue: mockUseCase() },
      { provide: ListParentBookingsUseCase, useValue: mockListUseCase() },
      { provide: ListTutorBookingsUseCase, useValue: mockListUseCase() },
      { provide: CreatePaymentOrderUseCase, useValue: mockUseCase() },
      { provide: VerifyPaymentUseCase, useValue: mockUseCase() },
      { provide: CapturePaymentUseCase, useValue: mockUseCase() },
      { provide: RetryPaymentUseCase, useValue: mockUseCase() },
      { provide: InitiateRefundUseCase, useValue: mockUseCase() },
      { provide: ApproveRefundUseCase, useValue: mockUseCase() },
      { provide: RejectRefundUseCase, useValue: mockUseCase() },
      { provide: GetPaymentUseCase, useValue: mockUseCase() },
      { provide: ListParentPaymentsUseCase, useValue: mockListUseCase() },
      { provide: ListAllPaymentsUseCase, useValue: mockListUseCase() },
      { provide: GetPaymentHistoryUseCase, useValue: mockUseCase() },
      { provide: GetRefundStatusUseCase, useValue: mockUseCase() },
      { provide: ListRefundsUseCase, useValue: mockUseCase() },
      { provide: ProcessPaymentWebhookUseCase, useValue: mockUseCase() },
      { provide: GetPaymentSummaryUseCase, useValue: mockUseCase() },
      { provide: CancelPaymentUseCase, useValue: mockUseCase() },
      { provide: ListUsersUseCase, useValue: mockUseCase() },
      { provide: GetUserUseCase, useValue: mockUseCase() },
      { provide: SuspendUserUseCase, useValue: mockUseCase() },
      { provide: ActivateUserUseCase, useValue: mockUseCase() },
      { provide: ListTutorsUseCase, useValue: mockUseCase() },
      { provide: ListBookingsUseCase, useValue: mockUseCase() },
      { provide: AdminGetBookingUseCase, useValue: mockUseCase() },
      { provide: AdminCancelBookingUseCase, useValue: mockUseCase() },
      { provide: ListPaymentsUseCase, useValue: mockUseCase() },
      { provide: AdminListRefundsUseCase, useValue: mockUseCase() },
      { provide: GetAdminOverviewUseCase, useValue: mockUseCase() },
      { provide: ListAuditLogsUseCase, useValue: mockUseCase() },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.use(requestIdMiddleware);
  app.useGlobalFilters(new ApiHttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  await app.init();

  return app;
}