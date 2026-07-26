export interface ReviewRecord {
  id: string;
  bookingId: string;
  parentId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  moderatedByUserId: string | null;
  moderatedAt: Date | null;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewRecord {
  bookingId: string;
  parentId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
}

export interface ReviewQueryOptions {
  tutorId?: string;
  parentId?: string;
  studentId?: string;
  status?: string;
  rating?: number;
  limit?: number;
  offset?: number;
}

export interface ReviewRepository {
  findById(id: string): Promise<ReviewRecord | null>;
  findByBookingIdAndParentId(bookingId: string, parentId: string): Promise<ReviewRecord | null>;
  findByTutorId(tutorId: string, opts?: ReviewQueryOptions): Promise<ReviewRecord[]>;
  findByParentId(parentId: string, opts?: ReviewQueryOptions): Promise<ReviewRecord[]>;
  findAllPendingModeration(opts?: { limit?: number; offset?: number }): Promise<ReviewRecord[]>;
  create(data: CreateReviewRecord): Promise<ReviewRecord>;
  moderate(id: string, status: string, moderatedByUserId: string): Promise<ReviewRecord>;
  updateRating(tutorId: string): Promise<{ averageRating: number; reviewCount: number }>;
}