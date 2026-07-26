// --- Admin & Moderation Module (Milestone 11D) ---
// Repository contracts for admin operations. The Admin module is an
// orchestration layer that reuses existing domain repositories for writes
// (UserRepository, BookingRepository, PaymentRepository) and introduces this
// dedicated AdminRepository for listing/overview reads and audit logging.

export interface AdminUserSummary {
  id: string;
  publicId: string;
  displayName: string | null;
  primaryRole: string;
  status: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
}

export interface AdminTutorSummary {
  id: string;
  userId: string;
  status: string;
  headline: string | null;
  city: string | null;
  experienceYears: number;
  averageRating: string;
  createdAt: Date;
}

export interface AdminBookingSummary {
  id: string;
  publicId: string;
  parentId: string;
  studentId: string;
  tutorId: string;
  classType: string;
  serviceMode: string;
  status: string;
  startAt: Date;
  endAt: Date;
  priceAmount: string;
  currency: string;
}

export interface AdminPaymentSummary {
  id: string;
  bookingId: string;
  parentId: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: Date;
}

export interface AdminRefundSummary {
  id: string;
  paymentId: string;
  bookingId: string;
  status: string;
  amount: number;
  currency: string;
  reason: string | null;
  requestedByUserId: string | null;
  createdAt: Date;
}

export interface AuditLogRecord {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

export interface AdminListQuery {
  cursor?: string | null;
  limit?: number;
  status?: string;
  role?: string;
  search?: string;
}

export interface AdminAuditLogQuery extends AdminListQuery {
  entityType?: string;
  action?: string;
}

export interface CursorPage<T> {
  data: T[];
  page: {
    nextCursor: string | null;
    limit: number;
    hasMore: boolean;
  };
}

export interface CreateAuditLogInput {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}

export interface AdminOverview {
  users: { total: number; byStatus: Record<string, number> };
  tutors: { total: number; byStatus: Record<string, number> };
  bookings: { total: number; byStatus: Record<string, number> };
  payments: { total: number; totalCapturedAmount: number };
  refunds: { total: number };
}

/**
 * Read/overview repository for the Admin module. Admin writes (suspend,
 * activate, cancel) reuse the existing UserRepository / BookingRepository.
 */
export interface AdminRepository {
  listUsers(query: AdminListQuery): Promise<CursorPage<AdminUserSummary>>;
  getUserById(id: string): Promise<AdminUserSummary | null>;
  listTutors(query: AdminListQuery): Promise<CursorPage<AdminTutorSummary>>;
  listBookings(query: AdminListQuery): Promise<CursorPage<AdminBookingSummary>>;
  getBookingById(id: string): Promise<AdminBookingSummary | null>;
  listPayments(query: AdminListQuery): Promise<CursorPage<AdminPaymentSummary>>;
  listRefunds(query: AdminListQuery): Promise<CursorPage<AdminRefundSummary>>;
  getOverview(): Promise<AdminOverview>;
  listAuditLogs(query: AdminAuditLogQuery): Promise<CursorPage<AuditLogRecord>>;
  createAuditLog(input: CreateAuditLogInput): Promise<AuditLogRecord>;
}