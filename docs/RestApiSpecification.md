# REST API Specification

## 1. Purpose

This document defines the Milestone 5 REST API contract for the tutor marketplace.

The API serves the Expo mobile app, the Next.js admin dashboard, background workers, and external webhooks. It is intentionally REST-first for MVP speed, clear OpenAPI generation, predictable mobile integration, and simple operational debugging.

## 2. API Principles

- Version every endpoint under `/v1`.
- Use public IDs in URLs and responses when exposing business records.
- Authenticate all user-specific endpoints with JWT access tokens.
- Authorize every resource by role and ownership.
- Validate every request body, route parameter, and query parameter.
- Use cursor pagination for list endpoints.
- Use idempotency keys for booking, payment, refund, and webhook-sensitive operations.
- Return consistent success and error shapes.
- Log a request ID for every request.
- Never expose KYC file keys, password hashes, refresh token hashes, OTP hashes, or internal operational secrets.

## 3. Base URL and Versioning

Local:

```text
http://localhost:4000/v1
```

Production:

```text
https://api.example.com/v1
```

Versioning is path-based. Breaking changes require a new version path such as `/v2`.

## 4. Common Headers

### Request Headers

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | Authenticated endpoints | `Bearer <accessToken>` |
| `Content-Type` | Body requests | `application/json` unless uploading files |
| `X-Request-Id` | Optional | Client-generated correlation ID |
| `Idempotency-Key` | Required for sensitive mutations | Unique client key for retry-safe operations |
| `Accept-Language` | Optional | Preferred locale such as `en-IN`, `hi-IN`, or `kn-IN` |

### Response Headers

| Header | Description |
| --- | --- |
| `X-Request-Id` | Correlation ID used in logs and errors |
| `X-RateLimit-Limit` | Current rate limit ceiling where applicable |
| `X-RateLimit-Remaining` | Remaining requests where applicable |
| `X-RateLimit-Reset` | Reset timestamp where applicable |

## 5. Authentication

### Token Model

- Access token: short-lived JWT.
- Refresh token: rotating opaque token stored as a server-side hash.
- Refresh token reuse should revoke the token family.
- Admin sessions should support stricter policies and MFA later.

### Auth Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/otp/start` | Public | Start OTP challenge for phone or email |
| `POST` | `/auth/otp/verify` | Public | Verify OTP and create or return session |
| `POST` | `/auth/login` | Public | Email/password login if password auth is enabled |
| `POST` | `/auth/google` | Public | Exchange Google token for platform session |
| `POST` | `/auth/apple` | Public | Exchange Apple token for platform session |
| `POST` | `/auth/refresh` | Public | Rotate refresh token and return new access token |
| `POST` | `/auth/logout` | User | Revoke current session |
| `POST` | `/auth/logout-all` | User | Revoke all sessions for current user |

### OTP Start Request

```json
{
  "channel": "PHONE",
  "phone": "+919876543210",
  "purpose": "LOGIN"
}
```

### Auth Response

```json
{
  "data": {
    "user": {
      "id": "usr_01JABC",
      "displayName": "Priya Sharma",
      "primaryRole": "PARENT",
      "roles": ["PARENT"],
      "status": "ACTIVE"
    },
    "accessToken": "jwt",
    "refreshToken": "opaque_refresh_token",
    "expiresInSeconds": 900
  }
}
```

## 6. Authorization Rules

Roles:

- `PARENT`
- `STUDENT`
- `TUTOR`
- `ADMIN`
- `SUPPORT`

Authorization combines RBAC with resource ownership.

Examples:

- Parents can manage only their own children.
- Tutors can manage only their own profile, availability, bookings, and learning records.
- Students can view only their own dashboard data when student login is enabled.
- Support can view operational records with masking.
- Admin-only payment, refund, verification, and audit actions require explicit permissions.

## 7. Standard Response Shapes

### Single Resource

```json
{
  "data": {
    "id": "booking_01JABC",
    "status": "REQUESTED"
  }
}
```

### List Resource

```json
{
  "data": [],
  "page": {
    "nextCursor": "eyJpZCI6IjAxIn0",
    "hasMore": false,
    "limit": 20
  }
}
```

### Empty Success

Use `204 No Content` for successful deletes, revocations, or simple acknowledgements where no response body is useful.

## 8. Standard Error Shape

```json
{
  "error": {
    "code": "BOOKING_SLOT_UNAVAILABLE",
    "message": "The selected time slot is no longer available.",
    "requestId": "req_01JABC",
    "details": {
      "slotId": "slot_01JABC"
    }
  }
}
```

### HTTP Status Mapping

| Status | Use |
| --- | --- |
| `400` | Invalid request shape or invalid state transition |
| `401` | Missing, invalid, or expired authentication |
| `403` | Authenticated but not authorized |
| `404` | Resource does not exist or is hidden from the caller |
| `409` | Conflict such as duplicate booking, slot unavailable, or idempotency mismatch |
| `422` | Valid JSON but domain validation failed |
| `429` | Rate limit exceeded |
| `500` | Unexpected server failure |
| `503` | Temporary dependency outage |

## 9. Pagination, Filtering, and Sorting

List endpoints use cursor pagination.

Common query parameters:

| Parameter | Description |
| --- | --- |
| `limit` | Default `20`, maximum `100` |
| `cursor` | Opaque cursor from previous response |
| `sort` | Supported sort key such as `createdAt.desc` |

Filtering should use explicit query parameters for high-value filters.

Example:

```text
GET /v1/search/tutors?subjectSlug=mathematics&grade=5&city=Bengaluru&serviceMode=HOME_TUITION&limit=20
```

## 10. Idempotency

Clients must send `Idempotency-Key` for:

- Booking checkout creation
- Booking state mutations
- Payment order creation
- Payment confirmation callbacks from clients
- Refund requests
- Wallet withdrawal requests

Rules:

- Same key and same request body returns the original result.
- Same key and different request body returns `409 IDEMPOTENCY_KEY_REUSED`.
- Keys should expire after a policy-defined period, usually 24 to 72 hours.

## 11. Public Catalog API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/subjects` | Public | List active subjects |
| `GET` | `/subjects/{subjectSlug}` | Public | Get subject detail |
| `GET` | `/catalog/filters` | Public | Get supported filters for search UI |
| `GET` | `/catalog/grades` | Public | Get grade options |
| `GET` | `/catalog/curricula` | Public | Get curriculum options |

## 12. Current User API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/me` | User | Current user, roles, and profile links |
| `PATCH` | `/me` | User | Update display name, locale, timezone, avatar |
| `GET` | `/me/sessions` | User | List active sessions |
| `DELETE` | `/me/sessions/{sessionId}` | User | Revoke a session |
| `GET` | `/me/notifications` | User | List notifications |
| `PATCH` | `/me/notifications/{notificationId}/read` | User | Mark notification read |
| `PATCH` | `/me/preferences` | User | Update notification and locale preferences |

## 13. Parent and Student API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/parents/me` | Parent | Get current parent profile |
| `PATCH` | `/parents/me` | Parent | Update parent profile |
| `GET` | `/parents/me/students` | Parent | List children |
| `POST` | `/parents/me/students` | Parent | Add child profile |
| `GET` | `/students/{studentId}` | Parent/Admin | Get child profile |
| `PATCH` | `/students/{studentId}` | Parent/Admin | Update child profile |
| `DELETE` | `/students/{studentId}` | Parent/Admin | Soft-delete child profile |
| `GET` | `/students/{studentId}/dashboard` | Parent/Student | Student dashboard summary |
| `GET` | `/students/{studentId}/attendance` | Parent/Student | Attendance records |
| `GET` | `/students/{studentId}/homework` | Parent/Student | Homework list |
| `GET` | `/students/{studentId}/assignments` | Parent/Student | Assignment list |
| `GET` | `/students/{studentId}/progress-reports` | Parent/Student | Progress reports |

### Create Student Request

```json
{
  "fullName": "Aarav Sharma",
  "dateOfBirth": "2016-08-14",
  "gender": "MALE",
  "grade": 4,
  "curriculum": "CBSE",
  "schoolName": "National Public School",
  "learningGoals": "Needs help with mathematics problem solving."
}
```

## 14. Tutor API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/tutors/me` | User | Create tutor profile for current user |
| `GET` | `/tutors/me` | Tutor | Get current tutor profile |
| `PATCH` | `/tutors/me` | Tutor | Update tutor profile |
| `GET` | `/tutors/{tutorId}` | Public | Public tutor profile |
| `GET` | `/tutors/me/subjects` | Tutor | List tutor offerings |
| `POST` | `/tutors/me/subjects` | Tutor | Add subject offering |
| `PATCH` | `/tutors/me/subjects/{tutorSubjectId}` | Tutor | Update subject offering |
| `DELETE` | `/tutors/me/subjects/{tutorSubjectId}` | Tutor | Deactivate subject offering |
| `GET` | `/tutors/me/qualifications` | Tutor | List qualifications |
| `POST` | `/tutors/me/qualifications` | Tutor | Add qualification |
| `GET` | `/tutors/me/service-areas` | Tutor | List service areas |
| `POST` | `/tutors/me/service-areas` | Tutor | Add service area |
| `GET` | `/tutors/me/performance` | Tutor | Performance summary |

### Tutor Profile Request

```json
{
  "headline": "Math and Science tutor for grades 3 to 8",
  "bio": "I focus on conceptual clarity and weekly practice.",
  "experienceYears": 6,
  "city": "Bengaluru",
  "locality": "Indiranagar",
  "baseHourlyRate": "600.00",
  "gender": "FEMALE"
}
```

## 15. Verification API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/tutors/me/verification` | Tutor | Get verification status |
| `POST` | `/tutors/me/verification/checks/{type}/documents` | Tutor | Upload or register verification document |
| `POST` | `/tutors/me/verification/submit` | Tutor | Submit profile for review |
| `GET` | `/admin/verifications` | Admin/Support | List pending verification cases |
| `GET` | `/admin/verifications/{tutorId}` | Admin/Support | Get verification case |
| `POST` | `/admin/verifications/{tutorId}/approve` | Admin | Approve tutor verification |
| `POST` | `/admin/verifications/{tutorId}/reject` | Admin | Reject tutor verification |
| `POST` | `/admin/verifications/{tutorId}/request-changes` | Admin | Request changes |

Document upload should use signed URLs or multipart upload endpoints. Direct object storage keys must not be exposed after upload finalization.

## 16. Search and Matching API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/search/tutors` | Public/Parent | Search tutors |
| `GET` | `/search/tutors/recommended` | Parent | Personalized recommendations |
| `POST` | `/search/tutors/intent` | Parent | Parse parent search intent after AI feature flag |

### Tutor Search Query

```text
GET /v1/search/tutors?subjectSlug=mathematics&grade=5&curriculum=CBSE&city=Bengaluru&serviceMode=HOME_TUITION&maxFee=800&availableFrom=2026-07-03T09:00:00.000Z&availableTo=2026-07-03T18:00:00.000Z&limit=20
```

### Tutor Search Response Item

```json
{
  "id": "tutor_01JABC",
  "displayName": "Ananya Rao",
  "headline": "Math specialist for grades 3 to 8",
  "city": "Bengaluru",
  "locality": "Indiranagar",
  "averageRating": "4.82",
  "reviewCount": 128,
  "completedClassesCount": 940,
  "verificationBadges": ["GOVERNMENT_ID", "DEGREE"],
  "startingHourlyRate": "600.00",
  "currency": "INR",
  "trialAvailable": true,
  "serviceModes": ["ONLINE", "HOME_TUITION"],
  "scoreExplanation": ["Subject match", "Available this week", "Highly rated"]
}
```

## 17. Availability API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/tutors/{tutorId}/availability` | Public/Parent | Public availability windows |
| `GET` | `/tutors/me/availability` | Tutor | Tutor availability slots |
| `POST` | `/tutors/me/availability` | Tutor | Create availability slot |
| `PATCH` | `/tutors/me/availability/{slotId}` | Tutor | Update availability slot |
| `DELETE` | `/tutors/me/availability/{slotId}` | Tutor | Block or remove slot |
| `POST` | `/availability/{slotId}/reserve` | Parent | Reserve slot for checkout |
| `POST` | `/availability/{slotId}/release` | Parent/System | Release reserved slot |

Availability reservation requires `Idempotency-Key`.

## 18. Booking API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/bookings/checkout` | Parent | Reserve slot and create payment order |
| `POST` | `/bookings` | Parent | Create booking request if payment is already authorized |
| `GET` | `/bookings` | User | List bookings visible to current user |
| `GET` | `/bookings/{bookingId}` | Participant/Admin | Booking detail |
| `POST` | `/bookings/{bookingId}/accept` | Tutor | Accept booking |
| `POST` | `/bookings/{bookingId}/reject` | Tutor | Reject booking |
| `POST` | `/bookings/{bookingId}/cancel` | Participant/Admin | Cancel booking |
| `POST` | `/bookings/{bookingId}/start` | Tutor/Admin | Mark class in progress |
| `POST` | `/bookings/{bookingId}/complete` | Tutor/Admin | Complete class |
| `POST` | `/bookings/{bookingId}/dispute` | Participant/Admin | Open booking dispute |
| `GET` | `/bookings/{bookingId}/status-history` | Participant/Admin | Booking state history |

### Booking Checkout Request

```json
{
  "studentId": "student_01JABC",
  "tutorId": "tutor_01JABC",
  "subjectId": "subject_01JABC",
  "tutorSubjectId": "tutor_subject_01JABC",
  "availabilitySlotId": "slot_01JABC",
  "classType": "TRIAL",
  "serviceMode": "ONLINE",
  "startAt": "2026-07-03T10:00:00.000Z",
  "endAt": "2026-07-03T11:00:00.000Z",
  "couponCode": "TRIAL100"
}
```

### Booking Checkout Response

```json
{
  "data": {
    "bookingId": "booking_01JABC",
    "status": "PENDING_PAYMENT",
    "payment": {
      "paymentId": "payment_01JABC",
      "provider": "RAZORPAY",
      "providerOrderId": "order_razorpay_123",
      "amount": "500.00",
      "currency": "INR"
    },
    "slotReservedUntil": "2026-07-03T09:45:00.000Z"
  }
}
```

Booking state mutation endpoints require `Idempotency-Key`.

## 19. Payment API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/payments/{paymentId}` | Parent/Admin | Payment detail |
| `POST` | `/payments/{paymentId}/confirm-client-result` | Parent | Confirm client-side result, still verified server-side |
| `GET` | `/payments` | Parent/Admin | List payments |
| `POST` | `/payments/{paymentId}/refunds` | Admin | Create refund |
| `GET` | `/refunds/{refundId}` | Participant/Admin | Refund detail |
| `GET` | `/invoices/{bookingId}` | Parent/Admin | Download invoice metadata or signed URL |

### Payment Confirmation Request

```json
{
  "provider": "RAZORPAY",
  "providerOrderId": "order_razorpay_123",
  "providerPaymentId": "pay_razorpay_123",
  "signature": "provider_signature"
}
```

The client confirmation is never the source of truth. Server-side webhook verification and reconciliation own final payment state.

## 20. Webhook API

Webhook endpoints are public but provider-signed.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/webhooks/razorpay` | Signature | Razorpay webhook receiver |
| `POST` | `/webhooks/stripe` | Signature | Stripe webhook receiver after Stripe is enabled |

Webhook processing rules:

- Verify provider signature before parsing trust-sensitive fields.
- Persist raw event metadata.
- Process idempotently by provider event ID.
- Return `2xx` only when the event is safely stored or processed.
- Never perform long-running side effects inline if they can be queued.

## 21. Wallet API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/wallet/me` | Tutor | Tutor wallet summary |
| `GET` | `/wallet/me/ledger` | Tutor | Ledger entries |
| `POST` | `/wallet/me/withdrawals` | Tutor | Request withdrawal after feature flag |
| `GET` | `/wallet/me/withdrawals` | Tutor | Withdrawal history |
| `GET` | `/admin/wallets/{tutorId}` | Admin | Admin wallet view |
| `POST` | `/admin/wallets/{tutorId}/adjustments` | Admin | Manual audited adjustment |

Withdrawal and adjustment requests require `Idempotency-Key`.

## 22. Attendance and Learning API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/bookings/{bookingId}/attendance` | Participant/Admin | Attendance detail |
| `POST` | `/bookings/{bookingId}/attendance` | Tutor/Admin | Mark attendance |
| `POST` | `/bookings/{bookingId}/check-in` | Participant | OTP check-in after feature flag |
| `POST` | `/bookings/{bookingId}/check-out` | Participant | OTP check-out after feature flag |
| `POST` | `/homework` | Tutor | Assign homework |
| `GET` | `/homework/{homeworkId}` | Participant/Admin | Homework detail |
| `POST` | `/homework/{homeworkId}/submissions` | Parent/Student | Submit homework |
| `POST` | `/homework/{homeworkId}/review` | Tutor | Review homework |
| `POST` | `/assignments` | Tutor | Assign structured assignment |
| `POST` | `/assignments/{assignmentId}/submissions` | Parent/Student | Submit assignment |
| `GET` | `/progress-reports/{reportId}` | Participant/Admin | Progress report detail |

## 23. Reviews API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/bookings/{bookingId}/reviews` | Parent | Submit review after completed class |
| `GET` | `/tutors/{tutorId}/reviews` | Public | Public tutor reviews |
| `GET` | `/admin/reviews` | Admin/Support | Moderation queue |
| `POST` | `/admin/reviews/{reviewId}/publish` | Admin | Publish review |
| `POST` | `/admin/reviews/{reviewId}/hide` | Admin | Hide review |

## 24. Messaging API

MVP can defer full real-time chat. These REST endpoints define the persisted contract for when chat is enabled.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/conversations` | User | List conversations |
| `GET` | `/conversations/{conversationId}` | Participant/Admin | Conversation detail |
| `GET` | `/conversations/{conversationId}/messages` | Participant/Admin | Message history |
| `POST` | `/conversations/{conversationId}/messages` | Participant | Send message |
| `POST` | `/messages/{messageId}/report` | Participant | Report abuse |

Conversations should be booking-linked unless an admin policy enables pre-booking consultation.

## 25. Notification API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/notifications` | User | List current user's notifications |
| `PATCH` | `/notifications/{notificationId}/read` | User | Mark read |
| `POST` | `/devices` | User | Register push token |
| `PATCH` | `/devices/{deviceId}` | User | Update push token/device metadata |
| `DELETE` | `/devices/{deviceId}` | User | Remove push token |

## 26. Coupons and Referrals API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/coupons/validate` | Parent | Validate coupon for checkout |
| `GET` | `/referrals/me` | Parent | Referral summary |
| `POST` | `/referrals/invite` | Parent | Invite friend |
| `GET` | `/admin/coupons` | Admin | List coupons |
| `POST` | `/admin/coupons` | Admin | Create coupon |
| `PATCH` | `/admin/coupons/{couponId}` | Admin | Update coupon |

## 27. Analytics API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/analytics/events` | Public/User | Record product event |
| `GET` | `/admin/analytics/overview` | Admin | Marketplace overview |
| `GET` | `/admin/analytics/funnels/booking` | Admin | Booking funnel |
| `GET` | `/admin/analytics/tutors` | Admin | Tutor liquidity metrics |

Analytics events should be accepted quickly and queued for downstream processing.

## 28. AI API

All AI endpoints require feature flags and audit logs.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/ai/tutor-matches` | Parent | Generate assisted tutor recommendations |
| `POST` | `/ai/study-plans` | Parent/Tutor | Generate study plan draft |
| `POST` | `/ai/progress-summaries` | Tutor/Admin | Generate progress summary draft |
| `POST` | `/ai/practice-questions` | Parent/Tutor | Generate practice questions |
| `GET` | `/ai/runs/{aiRunId}` | Requester/Admin | Get AI run result |

AI endpoints must identify verified source data and generated content separately in responses.

## 29. Admin API

Admin endpoints require admin/support auth and explicit permissions.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/admin/overview` | Admin/Support | Operational dashboard |
| `GET` | `/admin/users` | Admin/Support | List users |
| `GET` | `/admin/users/{userId}` | Admin/Support | User detail |
| `POST` | `/admin/users/{userId}/suspend` | Admin | Suspend account |
| `POST` | `/admin/users/{userId}/activate` | Admin | Activate account |
| `GET` | `/admin/tutors` | Admin/Support | List tutors |
| `GET` | `/admin/bookings` | Admin/Support | List bookings |
| `GET` | `/admin/bookings/{bookingId}` | Admin/Support | Booking detail |
| `POST` | `/admin/bookings/{bookingId}/cancel` | Admin | Admin cancellation |
| `GET` | `/admin/payments` | Admin/Finance | Payment list |
| `GET` | `/admin/refunds` | Admin/Finance | Refund list |
| `GET` | `/admin/audit-logs` | Admin | Audit logs |
| `GET` | `/admin/support-tickets` | Admin/Support | Support tickets |
| `POST` | `/admin/support-tickets/{ticketId}/messages` | Admin/Support | Reply to ticket |
| `GET` | `/admin/feature-flags` | Admin | List flags |
| `PATCH` | `/admin/feature-flags/{key}` | Admin | Update flag |

Admin mutations must write audit logs.

## 30. File Upload API

Use signed upload URLs for KYC documents, avatars, homework attachments, and chat attachments.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/uploads/sign` | User | Create signed upload URL |
| `POST` | `/uploads/complete` | User | Finalize uploaded object metadata |

### Signed Upload Request

```json
{
  "purpose": "TUTOR_VERIFICATION_DOCUMENT",
  "fileName": "degree.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 2400000
}
```

## 31. Rate Limits

Suggested MVP rate limits:

| Area | Limit |
| --- | --- |
| OTP start | 5 per phone/email per hour |
| OTP verify | 10 attempts per challenge |
| Login | 10 per IP per minute |
| Search | 60 per user per minute |
| Booking checkout | 10 per parent per minute |
| Payment confirmation | 20 per payment per hour |
| Webhooks | Provider-specific, signature protected |
| Messaging | 60 messages per user per minute |

## 32. OpenAPI Generation

The implementation should generate OpenAPI from NestJS decorators and DTOs.

Rules:

- Every endpoint must have operation ID, tags, auth metadata, request schema, response schema, and error examples.
- DTOs should use explicit enum values.
- Public examples should not contain real PII.
- Generated OpenAPI should be checked in or published as a CI artifact after implementation begins.

## 33. MVP Endpoint Priority

Build in this order:

1. Auth and current user
2. Parent and student profiles
3. Subjects and catalog filters
4. Tutor profile and tutor subjects
5. Verification submission and admin review
6. Availability
7. Search
8. Booking checkout and booking lifecycle
9. Razorpay webhook and payment reconciliation
10. Attendance
11. Homework
12. Reviews
13. Notifications
14. Admin booking/payment/audit views

## 34. Acceptance Criteria

Milestone 5 is complete when:

- Route groups are defined for the MVP.
- Auth, authorization, response, error, pagination, and idempotency rules are defined.
- Booking and payment contracts include concrete request and response examples.
- Webhook signature and idempotency behavior is specified.
- Admin operational endpoints are included.
- Future AI, chat, coupons, referrals, and wallet endpoints are present but clearly feature-gated where appropriate.

