# Milestone 11A — Payment Module Implementation Plan

## 1. Objective

Implement the complete **Payment module** as a separate bounded context following the existing Clean Architecture patterns. Reuse the existing `Payment`, `PaymentTransaction`, `PaymentWebhookEvent`, and `Refund` models already defined in the Prisma schema. **No schema changes are required** — all models, fields, enums, indexes, and relations already exist.

---

## 2. Architecture

```
packages/application/src/payments/
  payment.repository.ts      — Repository interfaces
  payment.gateway.ts          — Payment gateway abstraction (port)
  payment.dtos.ts             — DTOs + mapper functions
  payment.errors.ts           — Custom error classes
  payment.rules.ts            — Business rules, status transitions, refund policy
  payment.use-cases.ts        — All use cases
  index.ts                    — Barrel exports

packages/infrastructure/src/repositories/
  prisma-payment.repository.ts       — Prisma implementation of payment repository
  prisma-payment-gateway-razorpay.ts — Razorpay gateway adapter (first concrete gateway)

packages/infrastructure/src/gateways/
  razorpay-webhook-verifier.ts       — Webhook signature verification

apps/api/src/modules/payments/
  dto/
    create-payment-order.dto.ts
    verify-payment.dto.ts
    capture-payment.dto.ts
    initiate-refund.dto.ts
    payment-query.dto.ts
    payment-history-query.dto.ts
  payments.controller.ts
  payments.module.ts
```

### Layers

| Layer | Responsibility |
|---|---|
| **Application** | Use cases, repository interfaces, gateway port (interface), DTOs, custom errors, business rules |
| **Infrastructure** | Prisma repository implementations, gateway adapters (one per provider), webhook verifier |
| **API (NestJS)** | Thin controllers, DTO validation with class-validator, Swagger documentation, module registration |

---

## 3. Existing Schema Reuse

All schema models are already defined in `packages/database/prisma/schema.prisma`:

| Model | Key Fields for Payment Module |
|---|---|
| `Payment` | id, bookingId, parentId, provider (PaymentProvider enum), status (PaymentStatus enum), amount, platformFeeAmount, currency, providerOrderId (unique), providerPaymentId (unique), idempotencyKey (unique), authorizedAt, capturedAt, failedAt, metadata (Json), createdAt, updatedAt |
| `PaymentTransaction` | id, paymentId, provider, providerEventId (unique scoped to provider), eventType, status, amount, payload (Json), processedAt, createdAt |
| `PaymentWebhookEvent` | id, paymentId, provider, providerEventId (unique), eventType, status (PaymentEventStatus enum), payload (Json), receivedAt, processedAt, errorMessage |
| `Refund` | id, paymentId, bookingId, requestedByUserId, approvedByUserId, status (RefundStatus enum), amount, currency, reason, providerRefundId (unique), processedAt, createdAt, updatedAt |

### Enums Reused

- `PaymentProvider` — RAZORPAY, STRIPE, MANUAL
- `PaymentStatus` — PENDING, AUTHORIZED, CAPTURED, FAILED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED
- `PaymentEventStatus` — RECEIVED, PROCESSED, FAILED, IGNORED
- `RefundStatus` — REQUESTED, APPROVED, PROCESSING, PROCESSED, FAILED, REJECTED

### Existing Relations Used

- `Payment ↔ Booking` (via bookingId)
- `Payment ↔ Parent` (via parentId)
- `Payment ↔ PaymentTransaction` (via paymentId)
- `Payment ↔ PaymentWebhookEvent` (via paymentId)
- `Payment ↔ Refund` (via paymentId)
- `Refund ↔ Booking` (via bookingId)
- `Refund ↔ User (requestedBy/approvedBy)` (via requestedByUserId/approvedByUserId)

---

## 4. Required Schema Changes

**None.** The schema already contains:

- All necessary models with correct fields and types
- Unique constraints for idempotency (`idempotencyKey` unique on Payment)
- Unique constraints for deduplication (`providerEventId` unique on PaymentWebhookEvent)
- All enums with complete lifecycle values
- All indexes (bookingId, parentId, provider+status, createdAt, etc.)
- JSON metadata fields for invoice/receipt data
- Composite index for reconciliation queries

---

## 5. Repository Interfaces

File: `packages/application/src/payments/payment.repository.ts`

### Core Record Types

```typescript
export interface PaymentRecord {
  id: string;
  bookingId: string;
  parentId: string;
  provider: string;
  status: string;
  amount: string;          // Decimal as string to avoid precision loss
  platformFeeAmount: string;
  currency: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  idempotencyKey: string | null;
  authorizedAt: Date | null;
  capturedAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
  invoiceMetadata: Record<string, any> | null; // Receipt/invoice data
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRecord {
  bookingId: string;
  parentId: string;
  provider: string;
  amount: string;
  platformFeeAmount?: string;
  currency?: string;
  idempotencyKey?: string | null;
}

export interface PaymentTransactionRecord {
  id: string;
  paymentId: string;
  provider: string;
  providerEventId: string | null;
  eventType: string;
  status: string;
  amount: string | null;
  payload: Record<string, any> | null;
  processedAt: Date | null;
  createdAt: Date;
}

export interface CreatePaymentTransactionRecord {
  paymentId: string;
  provider: string;
  providerEventId?: string | null;
  eventType: string;
  status: string;
  amount?: string | null;
  payload?: Record<string, any> | null;
  processedAt?: Date | null;
}

export interface PaymentWebhookRecord {
  id: string;
  paymentId: string | null;
  provider: string;
  providerEventId: string;
  eventType: string;
  status: string;
  payload: Record<string, any>;
  receivedAt: Date;
  processedAt: Date | null;
  errorMessage: string | null;
}

export interface CreatePaymentWebhookRecord {
  paymentId?: string | null;
  provider: string;
  providerEventId: string;
  eventType: string;
  status?: string;
  payload: Record<string, any>;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  bookingId: string;
  requestedByUserId: string | null;
  approvedByUserId: string | null;
  status: string;
  amount: string;
  currency: string;
  reason: string | null;
  providerRefundId: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRefundRecord {
  paymentId: string;
  bookingId: string;
  requestedByUserId?: string | null;
  amount: string;
  currency?: string;
  reason?: string | null;
}

export interface PaymentQueryOptions {
  status?: string;
  provider?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}
```

### PaymentRepository Interface

```typescript
export interface PaymentRepository {
  // Payment CRUD
  findById(id: string): Promise<PaymentRecord | null>;
  findByBookingId(bookingId: string): Promise<PaymentRecord[]>;
  findByParentId(parentId: string, opts?: PaymentQueryOptions): Promise<PaymentRecord[]>;
  findByProviderOrderId(providerOrderId: string): Promise<PaymentRecord | null>;
  findByProviderPaymentId(providerPaymentId: string): Promise<PaymentRecord | null>;
  findByIdempotencyKey(key: string): Promise<PaymentRecord | null>;
  create(data: CreatePaymentRecord): Promise<PaymentRecord>;
  updatePayment(id: string, data: Partial<PaymentRecord>): Promise<PaymentRecord>;
  updateStatus(id: string, status: string, additional?: Record<string, any>): Promise<PaymentRecord>;

  // Payment Transactions (history)
  addTransaction(entry: CreatePaymentTransactionRecord): Promise<void>;
  getTransactions(paymentId: string): Promise<PaymentTransactionRecord[]>;

  // Webhook Events
  saveWebhookEvent(data: CreatePaymentWebhookRecord): Promise<PaymentWebhookRecord>;
  findWebhookByProviderEventId(provider: string, providerEventId: string): Promise<PaymentWebhookRecord | null>;
  getUnprocessedWebhooks(): Promise<PaymentWebhookRecord[]>;
  markWebhookProcessed(id: string, paymentId: string, error?: string): Promise<void>;

  // Refunds
  createRefund(data: CreateRefundRecord): Promise<RefundRecord>;
  findRefundById(id: string): Promise<RefundRecord | null>;
  findRefundsByPaymentId(paymentId: string): Promise<RefundRecord[]>;
  findRefundsByBookingId(bookingId: string): Promise<RefundRecord[]>;
  updateRefundStatus(id: string, status: string, approvedByUserId?: string, providerRefundId?: string): Promise<RefundRecord>;

  // Dashboard/Admin
  countByStatus(status: string): Promise<number>;
  findPendingRefunds(): Promise<(RefundRecord & { payment: PaymentRecord })[]>;
  getPaymentSummary(): Promise<{
    totalPayments: number;
    totalCapturedAmount: string;
    totalRefundedAmount: string;
    pendingCount: number;
    authorizedCount: number;
    capturedCount: number;
    failedCount: number;
    refundedCount: number;
    partiallyRefundedCount: number;
  }>;
}
```

---

## 6. Gateway Abstraction Design

File: `packages/application/src/payments/payment.gateway.ts`

### Port Interface

```typescript
/**
 * PaymentGatewayPort — Adapter interface for payment providers.
 * Each provider (Razorpay, Stripe, PayPal) implements this interface.
 */
export interface PaymentGatewayPort {
  readonly providerName: string;

  /** Create an order on the payment gateway */
  createOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult>;

  /** Verify payment after client-side confirmation */
  verifyPayment(params: VerifyGatewayPaymentParams): Promise<GatewayPaymentVerificationResult>;

  /** Capture an authorized payment */
  capturePayment(params: CaptureGatewayPaymentParams): Promise<GatewayCaptureResult>;

  /** Process a refund */
  refund(params: GatewayRefundParams): Promise<GatewayRefundResult>;

  /** Check payment status from gateway */
  getPaymentStatus(providerPaymentId: string): Promise<GatewayPaymentStatusResult>;

  /** Verify webhook signature */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
}
```

### Parameter/Result Types

```typescript
export interface CreateGatewayOrderParams {
  amount: number;         // In smallest currency unit (paise for INR, cents for USD)
  currency: string;
  receipt: string;        // Unique receipt identifier
  notes?: Record<string, string>;
  idempotencyKey?: string;
}

export interface GatewayOrderResult {
  providerOrderId: string;
  amount: number;
  currency: string;
  status: string;
  gatewayData: Record<string, any>;  // Pass through to frontend (e.g. razorpay_order_id)
}

export interface VerifyGatewayPaymentParams {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface GatewayPaymentVerificationResult {
  verified: boolean;
  status: string;
  amount: number;
  currency: string;
  providerPaymentId: string;
}

export interface CaptureGatewayPaymentParams {
  providerPaymentId: string;
  amount: number;   // In smallest currency unit
}

export interface GatewayCaptureResult {
  captured: boolean;
  status: string;
  providerPaymentId: string;
}

export interface GatewayRefundParams {
  providerPaymentId: string;
  amount: number;
  notes?: Record<string, string>;
}

export interface GatewayRefundResult {
  providerRefundId: string;
  status: string;
  amount: number;
}

export interface GatewayPaymentStatusResult {
  status: string;
  amount: number;
  currency: string;
  providerPaymentId: string;
  failureReason: string | null;
}
```

### Gateway Registry

```typescript
/** Registry holding all available gateway adapters */
export class PaymentGatewayRegistry {
  private readonly gateways = new Map<string, PaymentGatewayPort>();

  register(gateway: PaymentGatewayPort): void {
    this.gateways.set(gateway.providerName, gateway);
  }

  get(providerName: string): PaymentGatewayPort {
    const gateway = this.gateways.get(providerName);
    if (!gateway) throw new GatewayNotConfiguredError(providerName);
    return gateway;
  }
}
```

---

## 7. Payment Workflow

### Step 1: Create Payment Order

```
PARENT → POST /payments/orders
  │
  ├── 1. Validate request body (CreatePaymentOrderDto)
  │     ├── bookingId: string (required)
  │     ├── provider?: PaymentProvider (optional, default RAZORPAY)
  │     └── idempotencyKey?: string (optional)
  │
  ├── 2. Resolve parent profile from userId
  │
  ├── 3. Load booking, verify:
  │     ├── Booking exists
  │     ├── Booking belongs to parent
  │     └── Booking.status === "PENDING_PAYMENT"
  │
  ├── 4. Idempotency check:
  │     └── If idempotencyKey provided and exists → return existing payment order
  │
  ├── 5. Select gateway from PaymentGatewayRegistry
  │
  ├── 6. Call gateway.createOrder({
  │       amount: booking.priceAmount (in smallest unit),
  │       currency: booking.currency,
  │       receipt: booking.publicId,
  │       notes: { bookingId, parentId },
  │       idempotencyKey
  │     })
  │
  ├── 7. Create Payment record:
  │     ├── bookingId, parentId, provider
  │     ├── amount, platformFeeAmount, currency
  │     ├── providerOrderId (from gateway)
  │     ├── idempotencyKey (if provided)
  │     └── status: PENDING
  │
  ├── 8. Add PaymentTransaction:
  │     ├── eventType: "ORDER_CREATED"
  │     └── status: PENDING
  │
  └── 9. Return PaymentOrderDto {
        paymentId, provider, providerOrderId,
        amount, currency, gatewayData, status, createdAt
      }
```

### Step 2: Verify Payment

```
PARENT → POST /payments/:paymentId/verify
  │
  ├── 1. Validate request body (VerifyPaymentDto)
  │     ├── providerOrderId: string
  │     ├── providerPaymentId: string
  │     └── signature: string (gateway HMAC)
  │
  ├── 2. Load payment, verify:
  │     ├── Payment exists
  │     ├── Payment belongs to parent
  │     └── Payment.status === "PENDING"
  │
  ├── 3. Select gateway (from payment.provider)
  │
  ├── 4. Call gateway.verifyPayment({
  │       providerOrderId,
  │       providerPaymentId,
  │       signature
  │     })
  │
  ├── [SUCCESS PATH]
  │   ├── Update Payment:
  │   │   ├── status: AUTHORIZED
  │   │   ├── providerPaymentId
  │   │   └── authorizedAt: now()
  │   │
  │   ├── Add PaymentTransaction:
  │   │   ├── eventType: "PAYMENT_AUTHORIZED"
  │   │   └── status: AUTHORIZED
  │   │
  │   ├── Update Booking status: PAYMENT_AUTHORIZED
  │   │
  │   └── Return PaymentDto
  │
  └── [FAILURE PATH]
      ├── Update Payment:
      │   ├── status: FAILED
      │   └── failedAt: now()
      │
      ├── Add PaymentTransaction:
      │   ├── eventType: "VERIFICATION_FAILED"
      │   └── status: FAILED
      │
      └── Throw PaymentVerificationError
```

### Step 3: Capture Payment (Admin/Auto)

```
ADMIN → POST /admin/payments/:paymentId/capture
  │
  ├── 1. Load payment, verify:
  │     └── Payment.status === "AUTHORIZED"
  │
  ├── 2. Select gateway
  │
  ├── 3. Call gateway.capturePayment({
  │       providerPaymentId,
  │       amount
  │     })
  │
  ├── [SUCCESS PATH]
  │   ├── Update Payment:
  │   │   ├── status: CAPTURED
  │   │   └── capturedAt: now()
  │   │
  │   ├── Add PaymentTransaction:
  │   │   ├── eventType: "PAYMENT_CAPTURED"
  │   │   └── status: CAPTURED
  │   │
  │   ├── Create LedgerEntry for tutor wallet (PENDING)
  │   │
  │   └── Return PaymentDto
  │
  └── [FAILURE PATH]
      ├── Add PaymentTransaction:
      │   ├── eventType: "CAPTURE_FAILED"
      │   └── status: FAILED
      │
      ├── Notify admin
      └── Throw PaymentCaptureError
```

### Step 4: Payment Failure Handling

- **On verification failure**: Booking remains `PENDING_PAYMENT`. Parent can retry.
- **Retry flow**: `POST /bookings/:bookingId/payments/retry`
  1. Cancel old failed payment (`status: CANCELLED`)
  2. Add transaction for cancellation
  3. Create new payment order (same as Step 1)
- **Automatic expiry**: Background job expires `PENDING` payments older than N hours.
  - Marks payment as `FAILED` or `CANCELLED`
  - Moves booking back to `REQUESTED`

---

## 8. Refund Workflow

### Step 1: Initiate Refund (Admin)

```
ADMIN → POST /admin/refunds
  │
  ├── 1. Validate request body (InitiateRefundDto)
  │     ├── bookingId: string
  │     ├── amount: number (in smallest unit)
  │     └── reason?: string
  │
  ├── 2. Load booking, verify eligibility:
  │     ├── Booking status is CANCELLED_* or COMPLETED
  │     └── Within refund window (e.g. 30 days)
  │
  ├── 3. Load payments, verify:
  │     ├── Total captured amount >= refund amount
  │     ├── Sum of existing refunds + this refund <= total captured
  │     └── No duplicate refund in progress
  │
  └── 4. Create Refund record:
      ├── paymentId, bookingId, requestedByUserId
      ├── amount, currency, reason
      └── status: REQUESTED
```

### Step 2: Approve & Process Refund (Admin)

```
ADMIN → POST /admin/refunds/:refundId/approve
  │
  ├── 1. Load refund, verify:
  │     └── Refund.status === "REQUESTED"
  │
  ├── 2. Load payment, select gateway
  │
  ├── 3. Call gateway.refund({
  │       providerPaymentId,
  │       amount,
  │       notes: { refundId, reason }
  │     })
  │
  ├── [SUCCESS PATH]
  │   ├── Update Refund:
  │   │   ├── status: PROCESSED
  │   │   ├── providerRefundId
  │   │   ├── approvedByUserId
  │   │   └── processedAt: now()
  │   │
  │   ├── Update Payment status:
  │   │   ├── If full refund → REFUNDED
  │   │   └── If partial → PARTIALLY_REFUNDED
  │   │
  │   ├── Add PaymentTransaction:
  │   │   ├── eventType: "REFUND_PROCESSED"
  │   │   └── status: REFUNDED
  │   │
  │   ├── Update Booking status: REFUNDED (if full refund)
  │   │
  │   └── Return RefundDto
  │
  └── [FAILURE PATH]
      ├── Update Refund status: FAILED
      ├── Add PaymentTransaction: "REFUND_FAILED"
      └── Throw RefundProcessingError
```

### Reject Refund (Admin)

```
ADMIN → POST /admin/refunds/:refundId/reject
  │
  ├── Update Refund status: REJECTED
  └── Return RefundDto
```

---

## 9. Transaction Boundaries

| Operation | Transaction Scope | Rationale |
|---|---|---|
| Create Payment Order | Payment.create + Transaction.create | If either fails, no orphan payment record |
| Verify Payment | Payment.update + Transaction.create + Booking.updateStatus | Prevent double authorization for same booking |
| Capture Payment | Payment.update + Transaction.create + LedgerEntry.create | Captured money must be tracked in wallet |
| Process Refund | Refund.update + Payment.update + Transaction.create + Booking.updateStatus (if full) + LedgerEntry.create | Full consistency — refund must reflect everywhere |
| Retry Payment | Cancel old Payment + create new Payment + Transaction.create | Prevent multiple active payments per booking |
| Webhook Processing | WebhookEvent.save → Payment.update + Transaction.create | Idempotent — prevent duplicate processing |

**Implementation approach**: Use Prisma interactive transactions (`$transaction(async (tx) => { ... })`) for cross-context writes. The repository methods accept an optional `prismaTransaction` parameter. When provided, all operations within that method use the transaction client instead of the default client.

---

## 10. Use Cases

All use cases are in `packages/application/src/payments/payment.use-cases.ts`.

| # | Use Case | Input | Output | Auth |
|---|---|---|---|---|
| 1 | `CreatePaymentOrderUseCase` | `{ userId, data: CreatePaymentOrderInput }` | `PaymentOrderDto` | PARENT |
| 2 | `VerifyPaymentUseCase` | `{ userId, paymentId, data: VerifyPaymentInput }` | `PaymentDto` | PARENT |
| 3 | `CapturePaymentUseCase` | `{ userId, paymentId }` | `PaymentDto` | ADMIN |
| 4 | `RetryPaymentUseCase` | `{ userId, bookingId, data: CreatePaymentOrderInput }` | `PaymentOrderDto` | PARENT |
| 5 | `InitiateRefundUseCase` | `{ userId, data: InitiateRefundInput }` | `RefundDto` | ADMIN |
| 6 | `ApproveRefundUseCase` | `{ userId, refundId }` | `RefundDto` | ADMIN |
| 7 | `RejectRefundUseCase` | `{ userId, refundId }` | `RefundDto` | ADMIN |
| 8 | `GetPaymentUseCase` | `{ userId, paymentId }` | `PaymentWithTransactionsDto` | PARENT/ADMIN |
| 9 | `ListParentPaymentsUseCase` | `{ userId, query?: PaymentQueryInput }` | `PaymentDto[]` | PARENT |
| 10 | `ListAllPaymentsUseCase` | `{ userId, query?: PaymentQueryInput }` | `PaymentDto[]` | ADMIN |
| 11 | `GetPaymentHistoryUseCase` | `{ userId, paymentId }` | `PaymentTransactionDto[]` | PARENT/ADMIN |
| 12 | `GetRefundStatusUseCase` | `{ userId, refundId }` | `RefundDto` | ADMIN |
| 13 | `ListRefundsUseCase` | `{ userId, query?: RefundQueryInput }` | `RefundDto[]` | ADMIN |
| 14 | `ProcessPaymentWebhookUseCase` | `{ provider, payload, headers }` | `void` | PUBLIC (signature verified) |
| 15 | `GetPaymentSummaryUseCase` | `{ userId }` | `PaymentSummaryDto` | ADMIN |
| 16 | `CancelPaymentUseCase` | `{ userId, paymentId }` | `PaymentDto` | ADMIN |

---

## 11. API Endpoints

### Payment Endpoints (Parent-facing)

| Method | Path | Auth | Use Case | Description |
|---|---|---|---|---|
| `POST` | `/payments/orders` | PARENT | CreatePaymentOrderUseCase | Create payment order for a booking |
| `POST` | `/payments/:paymentId/verify` | PARENT | VerifyPaymentUseCase | Verify payment after gateway completion |
| `GET` | `/payments/:paymentId` | PARENT | GetPaymentUseCase | Get payment details with history |
| `GET` | `/payments` | PARENT | ListParentPaymentsUseCase | List parent's payments (filterable) |
| `GET` | `/payments/:paymentId/transactions` | PARENT | GetPaymentHistoryUseCase | Get payment transaction history |
| `POST` | `/bookings/:bookingId/payments/retry` | PARENT | RetryPaymentUseCase | Retry payment for a failed booking |

### Admin Payment Endpoints

| Method | Path | Auth | Use Case | Description |
|---|---|---|---|---|
| `POST` | `/admin/payments/:paymentId/capture` | ADMIN | CapturePaymentUseCase | Capture authorized payment |
| `POST` | `/admin/payments/:paymentId/cancel` | ADMIN | CancelPaymentUseCase | Cancel pending payment |
| `GET` | `/admin/payments` | ADMIN | ListAllPaymentsUseCase | List all payments (filterable) |
| `GET` | `/admin/payments/summary` | ADMIN | GetPaymentSummaryUseCase | Payment summary stats |
| `POST` | `/admin/refunds` | ADMIN | InitiateRefundUseCase | Initiate a refund |
| `POST` | `/admin/refunds/:refundId/approve` | ADMIN | ApproveRefundUseCase | Approve and process refund |
| `POST` | `/admin/refunds/:refundId/reject` | ADMIN | RejectRefundUseCase | Reject refund request |
| `GET` | `/admin/refunds` | ADMIN | ListRefundsUseCase | List all refunds |
| `GET` | `/admin/refunds/:refundId` | ADMIN | GetRefundStatusUseCase | Get refund details |

### Webhook Endpoints (Public, signature-verified)

| Method | Path | Auth | Use Case | Description |
|---|---|---|---|---|
| `POST` | `/webhooks/payments/razorpay` | PUBLIC | ProcessPaymentWebhookUseCase | Razorpay webhook receiver |
| `POST` | `/webhooks/payments/stripe` | PUBLIC | ProcessPaymentWebhookUseCase | Stripe webhook receiver |

---

## 12. DTOs

### Request DTOs (API layer, `apps/api/src/modules/payments/dto/`)

```typescript
// create-payment-order.dto.ts
class CreatePaymentOrderDto {
  @IsString() @IsNotEmpty()
  bookingId: string;

  @IsOptional() @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @IsOptional() @IsString()
  idempotencyKey?: string;
}

// verify-payment.dto.ts
class VerifyPaymentDto {
  @IsString() @IsNotEmpty()
  providerOrderId: string;

  @IsString() @IsNotEmpty()
  providerPaymentId: string;

  @IsString() @IsNotEmpty()
  signature: string;
}

// initiate-refund.dto.ts
class InitiateRefundDto {
  @IsString() @IsNotEmpty()
  bookingId: string;

  @IsNumber() @Min(1) @Type(() => Number)
  amount: number;

  @IsOptional() @IsString()
  reason?: string;
}

// payment-query.dto.ts
class PaymentQueryDto {
  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  provider?: string;

  @IsOptional() @IsString()
  from?: string;

  @IsOptional() @IsString()
  to?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  limit?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  offset?: number;
}
```

### Response DTOs (Application layer, `packages/application/src/payments/payment.dtos.ts`)

```typescript
export interface PaymentOrderDto {
  paymentId: string;
  provider: string;
  providerOrderId: string;
  amount: string;
  currency: string;
  gatewayData: Record<string, any>;
  status: string;
  createdAt: string;
}

export interface PaymentDto {
  id: string;
  bookingId: string;
  parentId: string;
  provider: string;
  status: string;
  amount: string;
  platformFeeAmount: string;
  currency: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  authorizedAt: string | null;
  capturedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentWithTransactionsDto extends PaymentDto {
  transactions: PaymentTransactionDto[];
}

export interface PaymentTransactionDto {
  id: string;
  provider: string;
  providerEventId: string | null;
  eventType: string;
  status: string;
  amount: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface RefundDto {
  id: string;
  paymentId: string;
  bookingId: string;
  status: string;
  amount: string;
  currency: string;
  reason: string | null;
  providerRefundId: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummaryDto {
  totalPayments: number;
  totalCapturedAmount: string;
  totalRefundedAmount: string;
  pendingCount: number;
  authorizedCount: number;
  capturedCount: number;
  failedCount: number;
  refundedCount: number;
  partiallyRefundedCount: number;
}
```

### Application Input DTOs

```typescript
export interface CreatePaymentOrderInput {
  bookingId: string;
  provider?: string;
  idempotencyKey?: string;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface InitiateRefundInput {
  bookingId: string;
  amount: number;
  reason?: string;
}

export interface PaymentQueryInput {
  status?: string;
  provider?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface RefundQueryInput {
  status?: string;
  paymentId?: string;
  bookingId?: string;
  limit?: number;
  offset?: number;
}
```

---

## 13. Files to Create

Total: **16 new files**

| # | File Path | Purpose |
|---|---|---|
| 1 | `packages/application/src/payments/payment.repository.ts` | Repository interfaces + record types |
| 2 | `packages/application/src/payments/payment.gateway.ts` | Payment gateway port interface + registry |
| 3 | `packages/application/src/payments/payment.dtos.ts` | DTO interfaces + mapper functions |
| 4 | `packages/application/src/payments/payment.errors.ts` | Custom error classes |
| 5 | `packages/application/src/payments/payment.rules.ts` | Business rules (status transitions, refund eligibility) |
| 6 | `packages/application/src/payments/payment.use-cases.ts` | All use case implementations |
| 7 | `packages/application/src/payments/index.ts` | Barrel exports |
| 8 | `packages/infrastructure/src/repositories/prisma-payment.repository.ts` | Prisma PaymentRepository implementation |
| 9 | `packages/infrastructure/src/gateways/razorpay-payment.gateway.ts` | Razorpay gateway adapter |
| 10 | `packages/infrastructure/src/gateways/razorpay-webhook-verifier.ts` | Razorpay webhook signature verification |
| 11 | `apps/api/src/modules/payments/dto/create-payment-order.dto.ts` | CreatePaymentOrderDto |
| 12 | `apps/api/src/modules/payments/dto/verify-payment.dto.ts` | VerifyPaymentDto |
| 13 | `apps/api/src/modules/payments/dto/initiate-refund.dto.ts` | InitiateRefundDto |
| 14 | `apps/api/src/modules/payments/dto/payment-query.dto.ts` | PaymentQueryDto, RefundQueryDto |
| 15 | `apps/api/src/modules/payments/payments.controller.ts` | Payment/Refund/Webhook controllers |
| 16 | `apps/api/src/modules/payments/payments.module.ts` | NestJS module |

---

## 14. Files to Modify

Total: **5 modified files**

| # | File | Change |
|---|---|---|
| 1 | `packages/application/src/index.ts` | Add payment module exports (use cases, errors, types) |
| 2 | `packages/infrastructure/src/index.ts` | Export PrismaPaymentRepository |
| 3 | `apps/api/src/modules/index.ts` | Export PaymentsModule |
| 4 | `apps/api/src/app.module.ts` | Import PaymentsModule |
| 5 | `packages/infrastructure/package.json` | Add Razorpay SDK dependency (`razorpay` npm package) |

---

## 15. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Idempotency double-charge** | Parent charged twice | `idempotencyKey` unique constraint on Payment table. Use case checks before creating order. |
| **Webhook replay attack** | Payment status incorrectly updated | `providerEventId` unique constraint on PaymentWebhookEvent. Duplicate detection. |
| **Race condition: booking cancelled during payment creation** | Payment for cancelled booking | Transactional booking status check within payment creation. |
| **Gateway API downtime** | Payment flow blocked | Retry with exponential backoff. Queue failed operations to outbox. |
| **Refund exceeds captured amount** | Balance inconsistency | Validate refund amount against sum(captured payments) - sum(existing refunds). |
| **Booking ↔ Payment status drift** | Inconsistent system state | All cross-context writes in single Prisma transaction. |
| **Webhook signature bypass** | Unauthorized payment updates | Strict HMAC-SHA256 verification. Reject unverifiable payloads with 401. |
| **Duplicate webhook delivery** | Double processing | Upsert on (provider, providerEventId). Idempotent processing. |
| **Decimal precision loss** | Monetary rounding errors | Store amounts as strings with Decimal type in Prisma. Convert to number in lowest unit for gateway calls. |

---

## 16. Acceptance Criteria

1. PARENT can create a payment order for a `PENDING_PAYMENT` booking
2. `idempotencyKey` prevents duplicate payment order creation
3. PARENT can verify payment after gateway returns (with HMAC signature validation)
4. Payment moves through lifecycle: `PENDING → AUTHORIZED → CAPTURED`
5. On verification failure, payment is marked `FAILED` and booking stays `PENDING_PAYMENT`
6. Retry creates new payment order and cancels old failed payment
7. ADMIN can capture an `AUTHORIZED` payment
8. ADMIN can initiate a refund (`REQUESTED` status)
9. ADMIN can approve a refund which calls gateway and updates all statuses
10. Refund is recorded as payment transaction history
11. Booking status reflects refund state (`REFUNDED`)
12. Payment history is queryable per payment, per booking, per parent
13. Webhook events are recorded, signature-verified, and idempotently processed
14. Swagger documentation present on all endpoints (via NestJS decorators)
15. All DTOs validated with class-validator decorators
16. Payment summary endpoint returns aggregated stats
17. Payment gateway abstracted behind `PaymentGatewayPort` interface
18. Razorpay adapter is the first concrete gateway implementation
19. Invoice/receipt metadata stored in `Payment.metadata` JSON field
20. Payment reconciliation possible via `PaymentTransaction` records with `providerEventId`
21. All existing tests pass after modifications
22. Linting passes with no errors

---

## 17. Estimated Complexity

**Medium-Large (8–10 developer days)**

| Area | Estimate | Details |
|---|---|---|
| Application layer interfaces + DTOs + Errors + Rules | 1 day | Repository interfaces, DTOs, mapper, errors (5 files) |
| Gateway port interface + Razorpay adapter | 1.5 days | Port interface, registry, Razorpay adapter, webhook verifier |
| Payment use cases (create, verify, capture, retry, cancel) | 2.5 days | Core payment lifecycle (5 use cases) |
| Refund use cases (initiate, approve, reject, list, status) | 1.5 days | Refund lifecycle (5 use cases) |
| Webhook processing use case | 1 day | Signature verification, idempotent processing, event routing |
| Prisma repository implementation | 1 day | All CRUD, transaction support, query methods |
| API controller + DTOs + Module | 1 day | NestJS controller (3 separate route groups), DTO classes, module |
| Integration wiring + index.ts exports | 0.5 day | Wire into app.module, export from packages |
| **Total** | **~10 days** | |