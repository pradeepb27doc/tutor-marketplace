import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller.js";
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
  PaymentGatewayRegistry,
} from "@tutor-marketplace/application";
import {
  PrismaPaymentRepository,
  PrismaBookingRepository,
  PrismaParentRepository,
  PrismaStudentRepository,
  PrismaTutorRepository,
  PrismaTutorSubjectRepository,
  PrismaTutorAvailabilitySlotRepository,
  RazorpayPaymentGateway,
  SystemClock,
} from "@tutor-marketplace/infrastructure";

@Module({
  controllers: [PaymentsController],
  providers: [
    // Use Cases
    {
      provide: CreatePaymentOrderUseCase,
      useFactory: (
        paymentRepo: any,
        bookingRepo: any,
        parentRepo: any,
        gatewayRegistry: any,
        clock: any,
      ) => new CreatePaymentOrderUseCase(paymentRepo, bookingRepo, parentRepo, gatewayRegistry, clock),
      inject: [
        "PaymentRepository",
        "BookingRepository",
        "ParentRepository",
        PaymentGatewayRegistry,
        "Clock",
      ],
    },
    {
      provide: VerifyPaymentUseCase,
      useFactory: (
        paymentRepo: any,
        bookingRepo: any,
        parentRepo: any,
        gatewayRegistry: any,
        clock: any,
      ) => new VerifyPaymentUseCase(paymentRepo, bookingRepo, parentRepo, gatewayRegistry, clock),
      inject: [
        "PaymentRepository",
        "BookingRepository",
        "ParentRepository",
        PaymentGatewayRegistry,
        "Clock",
      ],
    },
    {
      provide: CapturePaymentUseCase,
      useFactory: (paymentRepo: any, gatewayRegistry: any, clock: any) =>
        new CapturePaymentUseCase(paymentRepo, gatewayRegistry, clock),
      inject: ["PaymentRepository", PaymentGatewayRegistry, "Clock"],
    },
    {
      provide: RetryPaymentUseCase,
      useFactory: (
        paymentRepo: any,
        bookingRepo: any,
        parentRepo: any,
        gatewayRegistry: any,
        clock: any,
      ) => new RetryPaymentUseCase(paymentRepo, bookingRepo, parentRepo, gatewayRegistry, clock),
      inject: [
        "PaymentRepository",
        "BookingRepository",
        "ParentRepository",
        PaymentGatewayRegistry,
        "Clock",
      ],
    },
    {
      provide: InitiateRefundUseCase,
      useFactory: (paymentRepo: any, bookingRepo: any, clock: any) =>
        new InitiateRefundUseCase(paymentRepo, bookingRepo, clock),
      inject: ["PaymentRepository", "BookingRepository", "Clock"],
    },
    {
      provide: ApproveRefundUseCase,
      useFactory: (
        paymentRepo: any,
        bookingRepo: any,
        gatewayRegistry: any,
        clock: any,
      ) => new ApproveRefundUseCase(paymentRepo, bookingRepo, gatewayRegistry, clock),
      inject: ["PaymentRepository", "BookingRepository", PaymentGatewayRegistry, "Clock"],
    },
    {
      provide: RejectRefundUseCase,
      useFactory: (paymentRepo: any) => new RejectRefundUseCase(paymentRepo),
      inject: ["PaymentRepository"],
    },
    {
      provide: GetPaymentUseCase,
      useFactory: (paymentRepo: any, bookingRepo: any, parentRepo: any) =>
        new GetPaymentUseCase(paymentRepo, bookingRepo, parentRepo),
      inject: ["PaymentRepository", "BookingRepository", "ParentRepository"],
    },
    {
      provide: ListParentPaymentsUseCase,
      useFactory: (paymentRepo: any, parentRepo: any) =>
        new ListParentPaymentsUseCase(paymentRepo, parentRepo),
      inject: ["PaymentRepository", "ParentRepository"],
    },
    {
      provide: ListAllPaymentsUseCase,
      useFactory: (paymentRepo: any) => new ListAllPaymentsUseCase(paymentRepo),
      inject: ["PaymentRepository"],
    },
    {
      provide: GetPaymentHistoryUseCase,
      useFactory: (paymentRepo: any) => new GetPaymentHistoryUseCase(paymentRepo),
      inject: ["PaymentRepository"],
    },
    {
      provide: GetRefundStatusUseCase,
      useFactory: (paymentRepo: any) => new GetRefundStatusUseCase(paymentRepo),
      inject: ["PaymentRepository"],
    },
    {
      provide: ListRefundsUseCase,
      useFactory: (paymentRepo: any) => new ListRefundsUseCase(paymentRepo),
      inject: ["PaymentRepository"],
    },
    {
      provide: ProcessPaymentWebhookUseCase,
      useFactory: (paymentRepo: any, gatewayRegistry: any, clock: any) =>
        new ProcessPaymentWebhookUseCase(paymentRepo, gatewayRegistry, clock),
      inject: ["PaymentRepository", PaymentGatewayRegistry, "Clock"],
    },
    {
      provide: GetPaymentSummaryUseCase,
      useFactory: (paymentRepo: any) => new GetPaymentSummaryUseCase(paymentRepo),
      inject: ["PaymentRepository"],
    },
    {
      provide: CancelPaymentUseCase,
      useFactory: (paymentRepo: any, clock: any) => new CancelPaymentUseCase(paymentRepo, clock),
      inject: ["PaymentRepository", "Clock"],
    },

    // Gateway Registry (with Razorpay registered)
    {
      provide: PaymentGatewayRegistry,
      useFactory: (gateway: RazorpayPaymentGateway) => {
        const registry = new PaymentGatewayRegistry();
        registry.register(gateway);
        return registry;
      },
      inject: [RazorpayPaymentGateway],
    },
    {
      provide: RazorpayPaymentGateway,
      useClass: RazorpayPaymentGateway,
    },

    // Repositories
    {
      provide: "PaymentRepository",
      useClass: PrismaPaymentRepository,
    },
    {
      provide: "BookingRepository",
      useClass: PrismaBookingRepository,
    },
    {
      provide: "ParentRepository",
      useClass: PrismaParentRepository,
    },
    {
      provide: "StudentRepository",
      useClass: PrismaStudentRepository,
    },
    {
      provide: "TutorRepository",
      useClass: PrismaTutorRepository,
    },
    {
      provide: "TutorSubjectRepository",
      useClass: PrismaTutorSubjectRepository,
    },
    {
      provide: "TutorAvailabilitySlotRepository",
      useClass: PrismaTutorAvailabilitySlotRepository,
    },
    {
      provide: "Clock",
      useClass: SystemClock,
    },
  ],
})
export class PaymentsModule {}