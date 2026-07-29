# Security Model

## Overview

The Tutor Marketplace application follows a defense-in-depth approach with multiple layers of security controls. This document summarizes the security model, implemented controls, and remaining considerations.

---

## Authentication

### Token-Based Authentication
- **JWT access tokens** for API authentication (short-lived, configurable TTL)
- **Refresh tokens** for session continuity (stored hashed in database)
- Tokens issued via:
  - Email/password login
  - OTP (email or phone verification)
  - Social providers (via OTP flow)

### OTP Flow
- Rate-limited by challenge ID and destination
- Configurable max attempts per challenge
- Codes are hashed before storage
- Challenges expire after configurable TTL
- Consumed challenges cannot be reused

### Session Management
- Sessions tracked in database with device info, IP, user agent
- Users can list, revoke individual sessions, or logout all
- Refresh token rotation on each refresh

---

## Authorization

### Role-Based Access Control (RBAC)
- **Roles**: `admin`, `tutor`, `parent`, `student`
- NestJS `@Roles()` decorator enforces role checks at controller level
- Global `AuthGuard` checks:
  1. Token validity
  2. Role requirements (if specified via `@Roles()`)
  3. Public routes via `@Public()` decorator

### Guard Implementation
- `auth.guard.ts`: Global guard that extracts token, verifies, checks roles
- All controllers (except those with `@Public()`) require authentication
- Admin routes require `admin` role

---

## Data Protection

### Input Validation
- `ValidationPipe` with `whitelist: true` strips unknown properties
- `forbidNonWhitelisted: true` rejects requests with unexpected fields
- `class-validator` decorators on all DTOs

### API Responses
- Consistent error format: `{ error: { code, message, requestId } }`
- No stack traces exposed to clients
- 500 errors return generic "Unexpected server failure." message

### HTTP Security Headers
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` — limits referrer leakage
- `X-XSS-Protection: 1; mode=block` — legacy XSS filter

---

## Token Handling (Frontend)

### Storage
- Access tokens stored in `localStorage` (not sessionStorage)
- Refresh tokens also in `localStorage`
- **Note**: Consider using httpOnly cookies instead of localStorage for production

### Best Practices Implemented
- Tokens are not logged or exposed in error messages
- Automatic refresh on 401 responses
- Logout clears all stored tokens
- Fire-and-forget server-side logout on client logout

---

## XSS Prevention

- No `dangerouslySetInnerHTML` usage in codebase
- React's built-in XSS protection via JSX
- Input sanitization through ValidationPipe on backend
- CSP headers recommended for additional protection

---

## Safe External Links

- All external links should use `rel="noopener noreferrer"` and `target="_blank"` only when appropriate

---

## Audit Logging

- Admin actions logged to audit log table
- Request IDs tracked via `x-request-id` header
- Structured logging via `@tutor-marketplace/application` logger

---

## Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| localStorage token storage | Medium | Migrate to httpOnly cookies for production deployments |
| No rate limiting on auth endpoints | Medium | Add rate limiting middleware (e.g., `@nestjs/throttler`) |
| No CSRF protection | Medium | Add CSRF tokens if using cookie-based auth |
| No Content Security Policy | Low | Add CSP headers for production |
| No SQL injection protection | Low | Prisma ORM parameterizes queries by default |
| No Helmet.js | Low | Add `helmet` for additional Express security headers |
| Dependency vulnerabilities | Medium | Regular `pnpm audit` and automated Dependabot/Renovate |

---

## Recommendations for Production

1. **Replace localStorage** with httpOnly, secure, SameSite cookies
2. **Add rate limiting** to all auth endpoints
3. **Implement Content Security Policy** headers
4. **Add Helmet.js** middleware to NestJS
5. **Configure CORS** properly for production origins
6. **Set up automated dependency scanning** (Dependabot, Snyk, or Renovate)
7. **Add CSRF protection**
8. **Enable HTTPS enforcement**
9. **Implement WAF** (e.g., Cloudflare, AWS WAF)
10. **Regular penetration testing**