# Beta Launch Checklist

## Purpose

This checklist covers everything needed to launch the Tutor Marketplace beta. It includes infrastructure, monitoring, logging, backups, test accounts, test data, and manual QA.

---

## 1. Infrastructure

### Compute / Hosting

- [ ] Staging server(s) provisioned (CPU, RAM, disk)
- [ ] Docker and Docker Compose installed on host
- [ ] Container registry configured (Docker Hub, GHCR, or private registry)
- [ ] Reverse proxy / load balancer configured (Nginx, Traefik, Caddy)
- [ ] TLS/SSL certificates provisioned and auto-renewing (Let's Encrypt)
- [ ] Domain DNS records configured:
  - [ ] `staging.tutormarketplace.com` → Web
  - [ ] `api.staging.tutormarketplace.com` → API
  - [ ] `admin.staging.tutormarketplace.com` → Admin
- [ ] Firewall rules configured (only necessary ports open)
- [ ] SSH access restricted to authorized team members

### Database (PostgreSQL)

- [ ] PostgreSQL 16 instance running (managed or self-hosted)
- [ ] Connection pool limits configured (e.g., PgBouncer or app-level)
- [ ] Automated backups configured (daily minimum)
- [ ] Backup retention policy defined (e.g., 30 days)
- [ ] Point-in-time recovery (PITR) enabled
- [ ] Database monitoring configured (connection count, query performance)
- [ ] Connection string uses strong credentials (not defaults)

### Redis

- [ ] Redis 7 instance running (managed or self-hosted)
- [ ] Persistence configured (RDB/AOF) if data should survive restarts
- [ ] Max memory policy set (e.g., `allkeys-lru` for cache)
- [ ] Redis monitoring configured (memory usage, hit rate)

### Object Storage (for file uploads)

- [ ] S3-compatible bucket created (AWS S3, MinIO, DigitalOcean Spaces)
- [ ] Bucket policies configured (public read for avatars, private for documents)
- [ ] CORS configured for frontend domains

---

## 2. Monitoring

### Application Performance Monitoring (APM)

- [ ] Sentry DSN configured for API, Worker, Web, Admin
- [ ] Error tracking enabled for unhandled exceptions
- [ ] Performance tracing enabled (if using Sentry Performance)
- [ ] Source maps uploaded for stack trace readability

### Infrastructure Monitoring

- [ ] CPU/memory/disk monitoring configured (e.g., Prometheus + Grafana, Datadog)
- [ ] Docker container monitoring (restart counts, resource usage)
- [ ] PostgreSQL monitoring (connections, slow queries, replication lag)
- [ ] Redis monitoring (memory, evictions, hit rate)
- [ ] Uptime monitoring configured (e.g., Pingdom, UptimeRobot)
- [ ] Alerting configured for critical metrics (PagerDuty, Slack, email)

### Health Check Endpoints

- [ ] API health endpoint: `GET /health`
- [ ] Worker health check on startup
- [ ] Web health check (HTTP 200 on homepage)
- [ ] Admin health check (HTTP 200 on dashboard)
- [ ] External monitoring pings health endpoints every 1 minute

---

## 3. Logging

### Centralized Logging

- [ ] Application logs are structured (JSON format preferred)
- [ ] Logs shipped to centralized logging system (e.g., ELK, Loki, Datadog)
- [ ] Log retention policy defined (e.g., 30 days)
- [ ] Log levels configured appropriately:
  - [ ] Staging: `debug` or `info`
  - [ ] Production: `info` or `warn`

### Audit Logging

- [ ] Admin actions are logged (user management, verification decisions)
- [ ] Payment events are logged (order creation, verification, failure)
- [ ] Authentication events are logged (login, registration, password reset)

---

## 4. Backups

### Database Backups

- [ ] Automated daily PostgreSQL backup configured
- [ ] Backup stored in separate location (not same server)
- [ ] Backup restoration tested at least once
- [ ] Backup retention: daily for 7 days, weekly for 4 weeks, monthly for 3 months

### Application Backups

- [ ] Environment configuration backed up (`.env` files, secrets)
- [ ] Docker Compose files version-controlled
- [ ] Infrastructure-as-code (Terraform) version-controlled

### Disaster Recovery

- [ ] Recovery runbook documented
- [ ] Recovery time objective (RTO) defined: < 4 hours
- [ ] Recovery point objective (RPO) defined: < 1 hour

---

## 5. Test Accounts

### Pre-seeded Accounts for Staging

| Role     | Email                    | Password     | Notes                        |
|----------|--------------------------|--------------|------------------------------|
| Admin    | admin@tutormarketplace.com | Admin@123    | Full admin access            |
| Tutor    | tutor@tutormarketplace.com  | Tutor@123    | Verified tutor profile       |
| Student  | student@tutormarketplace.com | Student@123 | Can search and book          |
| Parent   | parent@tutormarketplace.com  | Parent@123  | Can manage students          |

### Account Setup

- [ ] Admin account created with full permissions
- [ ] Tutor account created with verified profile, subjects, availability
- [ ] Student account created with basic profile
- [ ] Parent account created with linked student accounts
- [ ] All test accounts use test mode for payments (Razorpay test keys)

---

## 6. Test Data

### Pre-seeded Data

- [ ] At least 5 tutor profiles with complete information:
  - [ ] Bio, subjects, qualifications, languages, service areas
  - [ ] Availability slots for the next 2 weeks
  - [ ] Profile photo (placeholder)
- [ ] At least 10 student profiles
- [ ] At least 3 parent accounts with linked students
- [ ] Sample reviews and ratings for tutors
- [ ] Sample bookings in various states:
  - [ ] Pending
  - [ ] Confirmed
  - [ ] In Progress
  - [ ] Completed
  - [ ] Cancelled
- [ ] Sample payments:
  - [ ] Successful payment
  - [ ] Failed payment
  - [ ] Refunded payment
- [ ] Sample notifications (read and unread)
- [ ] Sample verification cases (pending, approved, rejected)

### Data Seeding Script

- [ ] Seed script exists and can be run on demand:
  ```bash
  docker compose run --rm api pnpm --filter @tutor-marketplace/database prisma db seed
  ```
- [ ] Seed script is idempotent (can be run multiple times)

---

## 7. Manual QA

### Authentication & Authorization

- [ ] User registration works (student, tutor)
- [ ] Email verification flow works (if implemented)
- [ ] Login works for all roles
- [ ] Logout works
- [ ] Password reset works (if implemented)
- [ ] JWT token refresh works
- [ ] Route guards work (unauthenticated users redirected)
- [ ] Role-based access works (admin-only routes blocked for non-admins)

### Search & Discovery

- [ ] Search by subject returns relevant tutors
- [ ] Search by name returns relevant tutors
- [ ] Filters work (subject, price range, rating, location)
- [ ] Empty search state displays correctly
- [ ] Error state displays correctly
- [ ] Pagination works (if implemented)

### Tutor Profile

- [ ] Profile page loads for all tutors
- [ ] All sections display (bio, subjects, qualifications, languages, reviews)
- [ ] Availability calendar displays correctly
- [ ] Profile not found state works
- [ ] Loading skeleton displays during fetch

### Booking Flow

- [ ] Select date and time slot works
- [ ] Student details form works
- [ ] Review booking screen shows correct summary
- [ ] Booking confirmation creates the booking
- [ ] Booking success page displays
- [ ] Booking appears in user's booking list
- [ ] Booking appears in tutor's dashboard
- [ ] Booking cancellation works
- [ ] Booking rescheduling works (if implemented)

### Payment Flow

- [ ] Payment order creation works
- [ ] Razorpay checkout modal opens
- [ ] Successful payment redirects to success page
- [ ] Failed payment redirects to failure page
- [ ] Payment status is updated correctly
- [ ] Refund flow works (if implemented)

### Dashboards

- [ ] Student dashboard loads with correct data
- [ ] Tutor dashboard loads with correct data
- [ ] Admin dashboard loads with correct data
- [ ] All dashboard sections display correctly
- [ ] Empty states display when no data
- [ ] Error states display on fetch failure

### Admin Panel

- [ ] User management (list, search, view, edit)
- [ ] Tutor management (list, search, view, verify)
- [ ] Booking management (list, search, view, cancel)
- [ ] Payment management (list, search, view, refund)
- [ ] Review moderation (list, approve, reject, delete)
- [ ] Verification management (list, approve, reject)
- [ ] Audit log viewing

### Notifications

- [ ] Notification bell shows unread count
- [ ] Notification list displays correctly
- [ ] Mark as read works
- [ ] Notifications page loads with all notifications
- [ ] Real-time notifications (if implemented via WebSocket)

### Responsive Design

- [ ] Homepage renders correctly on mobile
- [ ] Search page renders correctly on mobile
- [ ] Booking flow works on mobile
- [ ] Dashboards render correctly on mobile
- [ ] Admin panel renders correctly on tablet/desktop

### Performance

- [ ] Homepage loads in < 3 seconds
- [ ] Search results load in < 2 seconds
- [ ] Tutor profile loads in < 2 seconds
- [ ] Booking flow is responsive
- [ ] API responses are < 500ms for common endpoints
- [ ] Lighthouse score > 80 for desktop

### Error Handling

- [ ] 404 page displays for unknown routes
- [ ] 500 error page displays gracefully
- [ ] Network error state displays when API is unreachable
- [ ] Form validation errors display correctly
- [ ] Timeout errors handled gracefully

---

## 8. Security Checklist

- [ ] All secrets stored in environment variables (not in code)
- [ ] JWT secret is strong (32+ characters, random)
- [ ] CORS configured for specific origins (not `*`)
- [ ] Rate limiting enabled on auth endpoints
- [ ] HTTPS enforced (TLS redirect)
- [ ] Security headers set (X-Frame-Options, CSP, etc.)
- [ ] Input validation on all API endpoints
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention (React auto-escapes, CSP headers)
- [ ] File upload validation (type, size, scan)
- [ ] Dependencies scanned for vulnerabilities (`pnpm audit`)
- [ ] Docker images scanned for vulnerabilities

---

## 9. Go/No-Go Decision

### Pre-Launch Verification

- [ ] All items in sections 1-8 are complete
- [ ] CI/CD pipeline passes for the release branch
- [ ] Docker images build and push successfully
- [ ] Staging environment is fully deployed and verified
- [ ] Smoke tests pass
- [ ] Team has approved the release

### Launch Steps

1. [ ] Tag the release (`git tag v0.1.0-beta`)
2. [ ] Push Docker images to registry
3. [ ] Run database migrations
4. [ ] Deploy services in order (API → Worker → Web → Admin)
5. [ ] Verify health endpoints
6. [ ] Run smoke tests
7. [ ] Monitor logs for 15 minutes
8. [ ] Announce beta launch to team

### Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rates (Sentry, logs)
- [ ] Monitor API response times
- [ ] Monitor database connection pool
- [ ] Monitor Redis memory usage
- [ ] Monitor disk space
- [ ] Check for any 5xx errors
- [ ] Verify backup ran successfully