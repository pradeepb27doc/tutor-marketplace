import type {
  TutorRepository,
  TutorRecord,
  CreateTutorRecord,
  TutorSubjectRepository,
  TutorSubjectRecord,
  CreateTutorSubjectRecord,
  SubjectRepository,
  SubjectRecord,
  TutorQualificationRepository,
  TutorQualificationRecord,
  CreateTutorQualificationRecord,
  TutorLanguageRepository,
  TutorLanguageRecord,
  CreateTutorLanguageRecord,
  TutorServiceAreaRepository,
  TutorServiceAreaRecord,
  CreateTutorServiceAreaRecord,
  TutorWeeklySlotRepository,
  TutorWeeklySlotRecord,
  CreateTutorWeeklySlotRecord,
  UpdateTutorWeeklySlotRecord,
  TutorBreakPeriodRepository,
  TutorBreakPeriodRecord,
  CreateTutorBreakPeriodRecord,
  TutorBlackoutPeriodRepository,
  TutorBlackoutPeriodRecord,
  CreateTutorBlackoutPeriodRecord,
  DayOfWeekValue,
  TutorVerificationRepository,
  VerificationCheckRecord,
  VerificationDocumentRecord,
  CreateVerificationDocumentRecord,
  UpsertVerificationCheckInput,
  VerificationCaseSummaryRecord,
  VerificationTypeValue,
  VerificationStatusValue,
  DocumentStatusValue,
  TutorSearchRepository,
  TutorSearchQuery,
  TutorSearchResult,
  TutorSearchCardRecord,
  TutorSearchSubjectDto,
  UserRoleRepository,
  UserRoleRecord,
  UserRepository,
  UserRecord,
  CreateUserRecord,
} from "@tutor-marketplace/application";

let _seq = 0;
function nextId(prefix: string): string {
  _seq++;
  return `${prefix}-${_seq}`;
}

// --- User / Role fakes ---

export class FakeUserRepository implements UserRepository {
  public users: UserRecord[] = [];

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }
  async findByPhone(phone: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.phone === phone) ?? null;
  }
  async findById(id: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async create(data: CreateUserRecord): Promise<UserRecord> {
    const record: UserRecord = {
      id: nextId("user"),
      publicId: `pub-${nextId("user")}`,
      email: data.email ?? null,
      phone: data.phone ?? null,
      passwordHash: data.passwordHash ?? null,
      displayName: data.displayName ?? null,
      avatarUrl: null,
      status: "ACTIVE",
      primaryRole: data.primaryRole,
      locale: data.locale ?? "en-IN",
      timezone: data.timezone ?? "Asia/Kolkata",
      emailVerifiedAt: data.email ? new Date() : null,
      phoneVerifiedAt: data.phone ? new Date() : null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.users.push(record);
    return record;
  }
  async update(id: string, data: Partial<UserRecord>): Promise<UserRecord> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("User not found");
    this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date() };
    return this.users[idx];
  }
}

export class FakeUserRoleRepository implements UserRoleRepository {
  public roles: UserRoleRecord[] = [];
  async findByUserId(userId: string): Promise<UserRoleRecord[]> {
    return this.roles.filter((r) => r.userId === userId);
  }
  async assignRole(userId: string, role: string): Promise<UserRoleRecord> {
    const record: UserRoleRecord = { id: nextId("role"), userId, role };
    this.roles.push(record);
    return record;
  }
}

// --- Subject fake ---

export class FakeSubjectRepository implements SubjectRepository {
  public subjects: SubjectRecord[] = [];

  async findAllActive(): Promise<SubjectRecord[]> {
    return this.subjects.filter((s) => s.isActive);
  }
  async findBySlug(slug: string): Promise<SubjectRecord | null> {
    return this.subjects.find((s) => s.slug === slug) ?? null;
  }
  async findById(id: string): Promise<SubjectRecord | null> {
    return this.subjects.find((s) => s.id === id) ?? null;
  }
}

// --- Tutor fake ---

export class FakeTutorRepository implements TutorRepository {
  public tutors: TutorRecord[] = [];

  async findByUserId(userId: string): Promise<TutorRecord | null> {
    return this.tutors.find((t) => t.userId === userId && !t.deletedAt) ?? null;
  }
  async findById(id: string): Promise<TutorRecord | null> {
    return this.tutors.find((t) => t.id === id && !t.deletedAt) ?? null;
  }
  async create(data: CreateTutorRecord): Promise<TutorRecord> {
    const record: TutorRecord = {
      id: nextId("tutor"),
      userId: data.userId,
      status: "PENDING_VERIFICATION",
      headline: data.headline ?? null,
      bio: data.bio ?? null,
      gender: data.gender ?? null,
      experienceYears: data.experienceYears ?? 0,
      city: data.city ?? null,
      locality: data.locality ?? null,
      baseHourlyRate: data.baseHourlyRate ?? null,
      currency: "INR",
      profileCompletionScore: 0,
      averageRating: "0.00",
      reviewCount: 0,
      completedClassesCount: 0,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tutors.push(record);
    return record;
  }
  async update(id: string, data: Partial<TutorRecord>): Promise<TutorRecord> {
    const idx = this.tutors.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Tutor not found");
    this.tutors[idx] = { ...this.tutors[idx], ...data, updatedAt: new Date() } as TutorRecord;
    return this.tutors[idx];
  }
}

// --- Tutor Subject fake ---

export class FakeTutorSubjectRepository implements TutorSubjectRepository {
  public subjects: TutorSubjectRecord[] = [];
  private subjectRepo: FakeSubjectRepository;

  constructor(subjectRepo: FakeSubjectRepository) {
    this.subjectRepo = subjectRepo;
  }

  async findByTutorId(tutorId: string): Promise<TutorSubjectRecord[]> {
    return this.subjects.filter((s) => s.tutorId === tutorId);
  }
  async findById(id: string): Promise<TutorSubjectRecord | null> {
    return this.subjects.find((s) => s.id === id) ?? null;
  }
  async findByTutorIdAndSubjectId(
    tutorId: string,
    subjectId: string,
  ): Promise<TutorSubjectRecord | null> {
    return this.subjects.find((s) => s.tutorId === tutorId && s.subjectId === subjectId) ?? null;
  }
  async create(data: CreateTutorSubjectRecord): Promise<TutorSubjectRecord> {
    const subject = this.subjectRepo.subjects.find((s) => s.id === data.subjectId) ?? null;
    const record: TutorSubjectRecord = {
      id: nextId("tsub"),
      tutorId: data.tutorId,
      subjectId: data.subjectId,
      gradeMin: data.gradeMin ?? null,
      gradeMax: data.gradeMax ?? null,
      hourlyRate: data.hourlyRate ?? null,
      serviceModes: [],
      curricula: [],
      isActive: true,
      createdAt: new Date(),
      subject: subject ?? undefined,
    };
    this.subjects.push(record);
    return record;
  }
  async softDelete(id: string): Promise<void> {
    const idx = this.subjects.findIndex((s) => s.id === id);
    if (idx !== -1) this.subjects.splice(idx, 1);
  }
}

// --- Tutor Qualification fake ---

export class FakeTutorQualificationRepository implements TutorQualificationRepository {
  public records: TutorQualificationRecord[] = [];

  async findByTutorId(tutorId: string): Promise<TutorQualificationRecord[]> {
    return this.records.filter((r) => r.tutorId === tutorId);
  }
  async findById(id: string): Promise<TutorQualificationRecord | null> {
    return this.records.find((r) => r.id === id) ?? null;
  }
  async create(data: CreateTutorQualificationRecord): Promise<TutorQualificationRecord> {
    const record: TutorQualificationRecord = {
      id: nextId("qual"),
      tutorId: data.tutorId,
      title: data.title,
      institutionName: data.institutionName ?? null,
      completionYear: data.completionYear ?? null,
      createdAt: new Date(),
    };
    this.records.push(record);
    return record;
  }
  async update(id: string, data: Partial<TutorQualificationRecord>): Promise<TutorQualificationRecord> {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Qualification not found");
    this.records[idx] = { ...this.records[idx], ...data };
    return this.records[idx];
  }
  async delete(id: string): Promise<void> {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx !== -1) this.records.splice(idx, 1);
  }
}

// --- Tutor Language fake ---

export class FakeTutorLanguageRepository implements TutorLanguageRepository {
  public records: TutorLanguageRecord[] = [];

  async findByTutorId(tutorId: string): Promise<TutorLanguageRecord[]> {
    return this.records.filter((r) => r.tutorId === tutorId);
  }
  async create(data: CreateTutorLanguageRecord): Promise<TutorLanguageRecord> {
    const record: TutorLanguageRecord = {
      id: nextId("lang"),
      tutorId: data.tutorId,
      language: data.language,
      proficiency: data.proficiency ?? null,
      createdAt: new Date(),
    };
    this.records.push(record);
    return record;
  }
  async delete(id: string): Promise<void> {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx !== -1) this.records.splice(idx, 1);
  }
}

// --- Tutor Service Area fake ---

export class FakeTutorServiceAreaRepository implements TutorServiceAreaRepository {
  public records: TutorServiceAreaRecord[] = [];

  async findByTutorId(tutorId: string): Promise<TutorServiceAreaRecord[]> {
    return this.records.filter((r) => r.tutorId === tutorId);
  }
  async create(data: CreateTutorServiceAreaRecord): Promise<TutorServiceAreaRecord> {
    const record: TutorServiceAreaRecord = {
      id: nextId("area"),
      tutorId: data.tutorId,
      city: data.city,
      locality: data.locality ?? null,
      radiusKm: data.radiusKm ?? "5.00",
      createdAt: new Date(),
    };
    this.records.push(record);
    return record;
  }
  async delete(id: string): Promise<void> {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx !== -1) this.records.splice(idx, 1);
  }
}

// --- Weekly slot fake ---

export class FakeTutorWeeklySlotRepository implements TutorWeeklySlotRepository {
  public slots: TutorWeeklySlotRecord[] = [];

  async findByTutorId(tutorId: string): Promise<TutorWeeklySlotRecord[]> {
    return this.slots.filter((s) => s.tutorId === tutorId);
  }
  async findById(id: string): Promise<TutorWeeklySlotRecord | null> {
    return this.slots.find((s) => s.id === id) ?? null;
  }
  async findOverlapping(
    tutorId: string,
    dayOfWeek: DayOfWeekValue,
    serviceMode: string,
    excludeSlotId?: string,
  ): Promise<TutorWeeklySlotRecord[]> {
    return this.slots.filter(
      (s) =>
        s.tutorId === tutorId &&
        s.dayOfWeek === dayOfWeek &&
        s.serviceMode === serviceMode &&
        s.id !== excludeSlotId,
    );
  }
  async create(data: CreateTutorWeeklySlotRecord): Promise<TutorWeeklySlotRecord> {
    const record: TutorWeeklySlotRecord = {
      id: nextId("slot"),
      tutorId: data.tutorId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      timezone: data.timezone ?? "Asia/Kolkata",
      serviceMode: data.serviceMode,
      capacity: data.capacity ?? 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.slots.push(record);
    return record;
  }
  async update(id: string, data: UpdateTutorWeeklySlotRecord): Promise<TutorWeeklySlotRecord> {
    const idx = this.slots.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Slot not found");
    this.slots[idx] = { ...this.slots[idx], ...data } as TutorWeeklySlotRecord;
    return this.slots[idx];
  }
  async delete(id: string): Promise<void> {
    const idx = this.slots.findIndex((s) => s.id === id);
    if (idx !== -1) this.slots.splice(idx, 1);
  }
}

// --- Break period fake ---

export class FakeTutorBreakPeriodRepository implements TutorBreakPeriodRepository {
  public breaks: TutorBreakPeriodRecord[] = [];

  async findByTutorId(tutorId: string): Promise<TutorBreakPeriodRecord[]> {
    return this.breaks.filter((b) => b.tutorId === tutorId);
  }
  async create(data: CreateTutorBreakPeriodRecord): Promise<TutorBreakPeriodRecord> {
    const record: TutorBreakPeriodRecord = {
      id: nextId("break"),
      tutorId: data.tutorId,
      dayOfWeek: data.dayOfWeek ?? null,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.breaks.push(record);
    return record;
  }
  async delete(id: string): Promise<void> {
    const idx = this.breaks.findIndex((b) => b.id === id);
    if (idx !== -1) this.breaks.splice(idx, 1);
  }
}

// --- Blackout period fake ---

export class FakeTutorBlackoutPeriodRepository implements TutorBlackoutPeriodRepository {
  public blackouts: TutorBlackoutPeriodRecord[] = [];

  async findByTutorId(tutorId: string): Promise<TutorBlackoutPeriodRecord[]> {
    return this.blackouts.filter((b) => b.tutorId === tutorId);
  }
  async findById(id: string): Promise<TutorBlackoutPeriodRecord | null> {
    return this.blackouts.find((b) => b.id === id) ?? null;
  }
  async create(data: CreateTutorBlackoutPeriodRecord): Promise<TutorBlackoutPeriodRecord> {
    const record: TutorBlackoutPeriodRecord = {
      id: nextId("blackout"),
      tutorId: data.tutorId,
      startAt: data.startAt,
      endAt: data.endAt,
      reason: data.reason ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blackouts.push(record);
    return record;
  }
  async delete(id: string): Promise<void> {
    const idx = this.blackouts.findIndex((b) => b.id === id);
    if (idx !== -1) this.blackouts.splice(idx, 1);
  }
}

// --- Verification fake ---

export class FakeTutorVerificationRepository implements TutorVerificationRepository {
  public checks: VerificationCheckRecord[] = [];
  public documents: VerificationDocumentRecord[] = [];
  public cases: VerificationCaseSummaryRecord[] = [];

  async findChecksByTutorId(tutorId: string): Promise<VerificationCheckRecord[]> {
    return this.checks.filter((c) => c.tutorId === tutorId);
  }
  async findCheckByTutorIdAndType(
    tutorId: string,
    type: VerificationTypeValue,
  ): Promise<VerificationCheckRecord | null> {
    return this.checks.find((c) => c.tutorId === tutorId && c.type === type) ?? null;
  }
  async upsertCheck(
    tutorId: string,
    type: VerificationTypeValue,
    data: UpsertVerificationCheckInput,
  ): Promise<VerificationCheckRecord> {
    const existing = await this.findCheckByTutorIdAndType(tutorId, type);
    if (existing) {
      Object.assign(existing, {
        status: data.status ?? existing.status,
        submittedAt: data.submittedAt ?? existing.submittedAt,
        updatedAt: new Date(),
      });
      return existing;
    }
    const record: VerificationCheckRecord = {
      id: nextId("vcheck"),
      tutorId,
      type,
      status: data.status ?? "NOT_SUBMITTED",
      submittedAt: data.submittedAt ?? null,
      reviewedByUserId: null,
      reviewedAt: null,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.checks.push(record);
    return record;
  }
  async setCheckStatus(
    checkId: string,
    status: VerificationStatusValue,
    opts?: { reviewedByUserId?: string; rejectionReason?: string | null },
  ): Promise<void> {
    const c = this.checks.find((x) => x.id === checkId);
    if (c) {
      c.status = status;
      c.reviewedByUserId = opts?.reviewedByUserId ?? null;
      c.reviewedAt = new Date();
      c.rejectionReason = opts?.rejectionReason ?? null;
    }
  }
  async createDocument(
    data: CreateVerificationDocumentRecord,
  ): Promise<VerificationDocumentRecord> {
    const record: VerificationDocumentRecord = {
      id: nextId("vdoc"),
      tutorId: data.tutorId,
      verificationCheckId: data.verificationCheckId,
      type: data.type,
      status: "UPLOADED",
      fileKey: data.fileKey,
      originalFileName: data.originalFileName ?? null,
      mimeType: data.mimeType ?? null,
      uploadedAt: new Date(),
      expiresAt: data.expiresAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.push(record);
    return record;
  }
  async findDocumentsByTutorId(tutorId: string): Promise<VerificationDocumentRecord[]> {
    return this.documents.filter((d) => d.tutorId === tutorId);
  }
  async findDocumentsByCheckId(checkId: string): Promise<VerificationDocumentRecord[]> {
    return this.documents.filter((d) => d.verificationCheckId === checkId);
  }
  async setDocumentStatus(docId: string, status: DocumentStatusValue): Promise<void> {
    const d = this.documents.find((x) => x.id === docId);
    if (d) d.status = status;
  }
  async listPendingCases(opts: {
    cursor?: string | null;
    limit: number;
  }): Promise<{ items: VerificationCaseSummaryRecord[]; nextCursor: string | null }> {
    const items = this.cases.slice(0, opts.limit);
    return { items, nextCursor: items.length === opts.limit ? "cursor" : null };
  }
  async getCaseByTutorId(tutorId: string): Promise<VerificationCaseSummaryRecord | null> {
    return this.cases.find((c) => c.tutor.id === tutorId) ?? null;
  }
  async approveVerification(
    tutorId: string,
    reviewerUserId: string,
    now: Date,
  ): Promise<void> {
    const c = this.cases.find((x) => x.tutor.id === tutorId);
    if (c) c.tutor.status = "ACTIVE";
  }
  async rejectVerification(
    tutorId: string,
    reviewerUserId: string,
    now: Date,
    rejectionReason: string,
  ): Promise<void> {
    const c = this.cases.find((x) => x.tutor.id === tutorId);
    if (c) c.tutor.status = "REJECTED";
  }
  async requestChangesVerification(
    tutorId: string,
    reviewerUserId: string,
    now: Date,
    note?: string | null,
  ): Promise<void> {
    const c = this.cases.find((x) => x.tutor.id === tutorId);
    if (c) c.tutor.status = "CHANGES_REQUESTED";
  }
}

// --- Search fake ---

export class FakeTutorSearchRepository implements TutorSearchRepository {
  public lastQuery: TutorSearchQuery | null = null;
  public result: TutorSearchResult = { items: [], nextCursor: null };

  async search(query: TutorSearchQuery): Promise<TutorSearchResult> {
    this.lastQuery = query;
    return this.result;
  }
}

export function buildSearchCard(overrides?: Partial<TutorSearchCardRecord>): TutorSearchCardRecord {
  return {
    id: nextId("card"),
    userId: nextId("user"),
    displayName: "Tutor Name",
    headline: "Math tutor",
    city: "Mumbai",
    locality: null,
    gender: "MALE",
    experienceYears: 5,
    averageRating: "4.50",
    reviewCount: 10,
    completedClassesCount: 50,
    baseHourlyRate: "500.00",
    currency: "INR",
    isVerified: false,
    primaryMode: "ONLINE",
    lowestHourlyRate: "400.00",
    subjectCount: 2,
    subjects: [
      { id: nextId("subj"), name: "Mathematics", slug: "mathematics" },
    ] as TutorSearchSubjectDto[],
    ...overrides,
  };
}