import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import type { Request } from "express";
import { randomUUID } from "node:crypto";
import { Roles } from "../auth/roles.decorator.js";
import { Public } from "../auth/public.decorator.js";
import { CreatePaymentOrderDto } from "./dto/create-payment-order.dto.js";
import { VerifyPaymentDto } from "./dto/verify-payment.dto.js";
import { InitiateRefundDto } from "./dto/initiate-refund.dto.js";
import { PaymentQueryDto, RefundQueryDto } from "./dto/payment-query.dto.js";
import { getEnv } from "@tutor-marketplace/config";
import {
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
} from "@tutor-marketplace/application";
import { listResponse, normalizeCursorOffset } from "../../common/api-response.js";

@ApiTags("Payments")
@ApiBearerAuth()
@Controller()
export class PaymentsController {
  constructor(
    private readonly createPaymentOrderUseCase: CreatePaymentOrderUseCase,
    private readonly verifyPaymentUseCase: VerifyPaymentUseCase,
    private readonly capturePaymentUseCase: CapturePaymentUseCase,
    private readonly retryPaymentUseCase: RetryPaymentUseCase,
    private readonly initiateRefundUseCase: InitiateRefundUseCase,
    private readonly approveRefundUseCase: ApproveRefundUseCase,
    private readonly rejectRefundUseCase: RejectRefundUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly listParentPaymentsUseCase: ListParentPaymentsUseCase,
    private readonly listAllPaymentsUseCase: ListAllPaymentsUseCase,
    private readonly getPaymentHistoryUseCase: GetPaymentHistoryUseCase,
    private readonly getRefundStatusUseCase: GetRefundStatusUseCase,
    private readonly listRefundsUseCase: ListRefundsUseCase,
    private readonly processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase,
    private readonly getPaymentSummaryUseCase: GetPaymentSummaryUseCase,
    private readonly cancelPaymentUseCase: CancelPaymentUseCase,
  ) {}

  // --- Create Payment Order (Parent) ---

  @Post("payments/orders")
  @HttpCode(HttpStatus.CREATED)
  @Roles("PARENT")
  @ApiOperation({ summary: "Create a payment order for a booking" })
  async createOrder(@Req() req: Request, @Body() dto: CreatePaymentOrderDto) {
    const user = (req as any).user;
    return {
      data: await this.createPaymentOrderUseCase.execute({
        userId: user.id,
        data: { bookingId: dto.bookingId, provider: dto.provider, idempotencyKey: dto.idempotencyKey },
      }),
    };
  }

  // --- Verify Payment / Confirm Client Result (Parent) ---

  @Post("payments/:paymentId/confirm-client-result")
  @HttpCode(HttpStatus.OK)
  @Roles("PARENT")
  @ApiOperation({ summary: "Verify a payment after gateway completion" })
  @ApiParam({ name: "paymentId", description: "Payment ID" })
  async verify(
    @Req() req: Request,
    @Param("paymentId") paymentId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    const user = (req as any).user;
    return {
      data: await this.verifyPaymentUseCase.execute({
        userId: user.id,
        paymentId,
        data: {
          providerOrderId: dto.providerOrderId,
          providerPaymentId: dto.providerPaymentId,
          signature: dto.signature,
        },
      }),
    };
  }

  // --- Get Payment (Parent/Admin) ---

  @Get("payments/:paymentId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get payment details with transaction history" })
  @ApiParam({ name: "paymentId", description: "Payment ID" })
  async get(@Req() req: Request, @Param("paymentId") paymentId: string) {
    const user = (req as any).user;
    return {
      data: await this.getPaymentUseCase.execute({ userId: user.id, paymentId }),
    };
  }

  // --- List Parent Payments ---

  @Get("payments")
  @HttpCode(HttpStatus.OK)
  @Roles("PARENT")
  @ApiOperation({ summary: "List the current parent's payments" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by payment status" })
  @ApiQuery({ name: "provider", required: false, type: String, description: "Filter by provider" })
  @ApiQuery({ name: "from", required: false, type: String, description: "Created from (ISO date)" })
  @ApiQuery({ name: "to", required: false, type: String, description: "Created to (ISO date)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  async listParent(@Req() req: Request, @Query() query: PaymentQueryDto) {
    const user = (req as any).user;
    const data = await this.listParentPaymentsUseCase.execute({
        userId: user.id,
        query: this.toPaymentQuery(query),
      });
    return listResponse(data, { limit: query.limit, cursor: query.cursor });
  }

  // --- Get Payment History ---

  @Get("payments/:paymentId/transactions")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get payment transaction history" })
  @ApiParam({ name: "paymentId", description: "Payment ID" })
  async history(@Req() req: Request, @Param("paymentId") paymentId: string) {
    const user = (req as any).user;
    return {
      data: await this.getPaymentHistoryUseCase.execute({ userId: user.id, paymentId }),
    };
  }

  // --- Retry Payment (Parent) ---

  @Post("bookings/:bookingId/payments/retry")
  @HttpCode(HttpStatus.CREATED)
  @Roles("PARENT")
  @ApiOperation({ summary: "Retry payment for a failed/pending booking" })
  @ApiParam({ name: "bookingId", description: "Booking ID" })
  async retry(
    @Req() req: Request,
    @Param("bookingId") bookingId: string,
    @Body() dto: CreatePaymentOrderDto,
  ) {
    const user = (req as any).user;
    return {
      data: await this.retryPaymentUseCase.execute({
        userId: user.id,
        bookingId,
        data: { bookingId: dto.bookingId, provider: dto.provider, idempotencyKey: dto.idempotencyKey },
      }),
    };
  }

  // --- Capture Payment (Admin) ---

  @Post("admin/payments/:paymentId/capture")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Capture an authorized payment" })
  @ApiParam({ name: "paymentId", description: "Payment ID" })
  async capture(@Req() req: Request, @Param("paymentId") paymentId: string) {
    const user = (req as any).user;
    return {
      data: await this.capturePaymentUseCase.execute({ userId: user.id, paymentId }),
    };
  }

  // --- Cancel Payment (Admin) ---

  @Post("admin/payments/:paymentId/cancel")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Cancel a pending/authorized payment" })
  @ApiParam({ name: "paymentId", description: "Payment ID" })
  async cancel(@Req() req: Request, @Param("paymentId") paymentId: string) {
    const user = (req as any).user;
    return {
      data: await this.cancelPaymentUseCase.execute({ userId: user.id, paymentId }),
    };
  }

  // --- List All Payments (Admin) ---

  @Get("admin/payments")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "List all payments (admin)" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by payment status" })
  @ApiQuery({ name: "provider", required: false, type: String, description: "Filter by provider" })
  @ApiQuery({ name: "from", required: false, type: String, description: "Created from (ISO date)" })
  @ApiQuery({ name: "to", required: false, type: String, description: "Created to (ISO date)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  async listAll(@Req() req: Request, @Query() query: PaymentQueryDto) {
    const user = (req as any).user;
    return {
      data: await this.listAllPaymentsUseCase.execute({
        userId: user.id,
        query: this.toPaymentQuery(query),
      }),
    };
  }

  // --- Payment Summary (Admin) ---

  @Get("admin/payments/summary")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get aggregated payment summary stats" })
  async summary(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.getPaymentSummaryUseCase.execute({ userId: user.id }),
    };
  }

  // --- Initiate Refund (Admin) ---

  @Post("admin/refunds")
  @HttpCode(HttpStatus.CREATED)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Initiate a refund for a booking" })
  async initiateRefund(@Req() req: Request, @Body() dto: InitiateRefundDto) {
    const user = (req as any).user;
    return {
      data: await this.initiateRefundUseCase.execute({
        userId: user.id,
        data: { bookingId: dto.bookingId ?? "", amount: dto.amount, reason: dto.reason },
      }),
    };
  }

  // --- Create Refund for Payment (Admin) ---

  @Post("payments/:paymentId/refunds")
  @HttpCode(HttpStatus.CREATED)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Create a refund for a payment" })
  @ApiParam({ name: "paymentId", description: "Payment ID" })
  async initiatePaymentRefund(
    @Req() req: Request,
    @Param("paymentId") paymentId: string,
    @Body() dto: InitiateRefundDto,
  ) {
    const user = (req as any).user;
    return {
      data: await this.initiateRefundUseCase.execute({
        userId: user.id,
        data: { bookingId: dto.bookingId ?? paymentId, amount: dto.amount, reason: dto.reason },
      }),
    };
  }

  // --- Approve Refund (Admin) ---

  @Post("admin/refunds/:refundId/approve")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Approve and process a refund" })
  @ApiParam({ name: "refundId", description: "Refund ID" })
  async approveRefund(@Req() req: Request, @Param("refundId") refundId: string) {
    const user = (req as any).user;
    return {
      data: await this.approveRefundUseCase.execute({ userId: user.id, refundId }),
    };
  }

  // --- Reject Refund (Admin) ---

  @Post("admin/refunds/:refundId/reject")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Reject a refund request" })
  @ApiParam({ name: "refundId", description: "Refund ID" })
  async rejectRefund(@Req() req: Request, @Param("refundId") refundId: string) {
    const user = (req as any).user;
    return {
      data: await this.rejectRefundUseCase.execute({ userId: user.id, refundId }),
    };
  }

  // --- List Refunds (Admin) ---

  @Get("admin/refunds")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  @ApiOperation({ summary: "List all refunds (admin)" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by refund status" })
  @ApiQuery({ name: "paymentId", required: false, type: String, description: "Filter by payment ID" })
  @ApiQuery({ name: "bookingId", required: false, type: String, description: "Filter by booking ID" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page" })
  @ApiQuery({ name: "cursor", required: false, type: String, description: "Opaque cursor from previous page" })
  async listRefunds(@Req() req: Request, @Query() query: RefundQueryDto) {
    const user = (req as any).user;
    const data = await this.listRefundsUseCase.execute({
        userId: user.id,
        query: {
          status: query.status,
          paymentId: query.paymentId,
          bookingId: query.bookingId,
          limit: query.limit,
          offset: query.offset ?? normalizeCursorOffset(query.cursor),
        },
      });
    return listResponse(data, { limit: query.limit, cursor: query.cursor });
  }

  // --- Get Refund Status (Admin/Participant) ---

  @Get("refunds/:refundId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get refund details" })
  @ApiParam({ name: "refundId", description: "Refund ID" })
  async getRefund(@Req() req: Request, @Param("refundId") refundId: string) {
    const user = (req as any).user;
    return {
      data: await this.getRefundStatusUseCase.execute({ userId: user.id, refundId }),
    };
  }

  // --- Webhook Receiver (Public) ---

  @Post("webhooks/razorpay")
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: "Razorpay webhook receiver (signature verified)" })
  async razorpayWebhook(
    @Req() req: Request,
    @Headers("x-razorpay-signature") signature: string,
  ) {
    const webhookSecret = getEnv().RAZORPAY_WEBHOOK_SECRET ?? "";
    const payload = req.body as Record<string, any>;
    await this.processPaymentWebhookUseCase.execute({
      provider: "RAZORPAY",
      payload,
      signature: signature ?? "",
      webhookSecret,
      generateId: () => randomUUID(),
    });
    return { data: { received: true } };
  }

  private toPaymentQuery(query: PaymentQueryDto) {
    return {
      status: query.status,
      provider: query.provider,
      from: query.from,
      to: query.to,
      limit: query.limit,
      offset: query.offset ?? normalizeCursorOffset(query.cursor),
    };
  }
}