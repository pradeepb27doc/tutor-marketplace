import type {
  TutorSearchRepository,
  TutorSearchQuery,
  TutorSearchResult,
  TutorSearchCardRecord,
  TutorSearchMode,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";
import { REQUIRED_VERIFICATION_TYPES } from "@tutor-marketplace/application";

const ONLINE_MODE = "ONLINE";
const PHYSICAL_MODES = ["HOME_TUITION", "GROUP_CLASS", "WEEKEND_CLASS", "HOLIDAY_CAMP"];

export class PrismaTutorSearchRepository implements TutorSearchRepository {
  private get db() {
    return getPrismaClient();
  }

  async search(query: TutorSearchQuery): Promise<TutorSearchResult> {
    const { filters, sort, cursor, limit } = query;

    const where: any = {
      status: "ACTIVE",
      deletedAt: null,
    };

    if (filters.city) where.city = filters.city;
    if (filters.locality) where.locality = { contains: filters.locality, mode: "insensitive" };
    if (filters.gender) where.gender = filters.gender;
    if (typeof filters.minRating === "number") {
      where.averageRating = { gte: filters.minRating };
    }
    if (typeof filters.experienceMin === "number" || typeof filters.experienceMax === "number") {
      where.experienceYears = {};
      if (typeof filters.experienceMin === "number") where.experienceYears.gte = filters.experienceMin;
      if (typeof filters.experienceMax === "number") where.experienceYears.lte = filters.experienceMax;
    }
    if (typeof filters.priceMin === "number" || typeof filters.priceMax === "number") {
      where.baseHourlyRate = {};
      if (typeof filters.priceMin === "number") where.baseHourlyRate.gte = filters.priceMin;
      if (typeof filters.priceMax === "number") where.baseHourlyRate.lte = filters.priceMax;
    }

    // Subject / grade / curriculum / service-mode constraints
    const subjectWhere: Record<string, unknown> = { isActive: true };
    if (filters.subjectId) subjectWhere.subjectId = filters.subjectId;
    if (typeof filters.grade === "number") {
      subjectWhere.OR = [
        { gradeMin: null, gradeMax: null },
        { gradeMin: { lte: filters.grade }, gradeMax: { gte: filters.grade } },
      ];
    }
    if (Array.isArray(filters.curricula) && filters.curricula.length > 0) {
      subjectWhere.curricula = { hasSome: filters.curricula };
    }
    if (filters.mode) {
      subjectWhere.serviceModes = this.serviceModeFilter(filters.mode);
    }
    where.subjectOfferings = { some: subjectWhere };

    if (filters.verifiedOnly) {
      where.verificationChecks = {
        some: {
          OR: REQUIRED_VERIFICATION_TYPES.map((type) => ({
            type,
            status: "APPROVED",
          })),
        },
        every: {
          OR: REQUIRED_VERIFICATION_TYPES.map((type) => ({
            type,
            status: "APPROVED",
          })),
        },
      };
    }

    const orderBy = this.toOrderBy(sort);

    const take = limit + 1;
    const records: any[] = await this.db.tutor.findMany({
      where,
      orderBy,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: { select: { displayName: true } },
        subjectOfferings: {
          where: { isActive: true },
          include: { subject: true },
        },
        verificationChecks: {
          where: { type: { in: REQUIRED_VERIFICATION_TYPES } },
          select: { type: true, status: true },
        },
      },
    });

    let nextCursor: string | null = null;
    if (records.length > limit) {
      nextCursor = records[limit - 1].id;
      records.length = limit;
    }

    const items: TutorSearchCardRecord[] = records.map((t) =>
      this.toCardRecord(t),
    );

    return { items, nextCursor };
  }

  private serviceModeFilter(mode: TutorSearchMode): Record<string, unknown> {
    if (mode === "ONLINE") return { has: ONLINE_MODE };
    if (mode === "OFFLINE") return { hasSome: PHYSICAL_MODES };
    // HYBRID: has online AND at least one physical mode
    return { has: ONLINE_MODE, hasSome: PHYSICAL_MODES };
  }

  private toOrderBy(sort: string): Record<string, string>[] {
    switch (sort) {
      case "EXPERIENCE":
        return [{ experienceYears: "desc" }, { id: "asc" }];
      case "PRICE_ASC":
        return [{ baseHourlyRate: "asc" }, { id: "asc" }];
      case "PRICE_DESC":
        return [{ baseHourlyRate: "desc" }, { id: "asc" }];
      case "NEWEST":
        return [{ createdAt: "desc" }, { id: "asc" }];
      case "MOST_BOOKED":
        return [{ completedClassesCount: "desc" }, { id: "asc" }];
      case "RATING":
      default:
        return [{ averageRating: "desc" }, { id: "asc" }];
    }
  }

  private toCardRecord(t: any): TutorSearchCardRecord {
    const subjects = (t.subjectOfferings ?? []).filter((s: any) => s.subject);
    const subjectSummaries = subjects.map((s: any) => ({
      id: s.subject.id,
      name: s.subject.name,
      slug: s.subject.slug,
    }));
    const rates = subjects
      .map((s: any) => (s.hourlyRate != null ? Number(s.hourlyRate) : null))
      .filter((r: number | null): r is number => r != null);
    const lowest = rates.length ? Math.min(...rates) : null;

    const modes = new Set<string>();
    subjects.forEach((s: any) => (s.serviceModes ?? []).forEach((m: string) => modes.add(m)));
    const hasOnline = modes.has(ONLINE_MODE);
    const hasPhysical = PHYSICAL_MODES.some((m) => modes.has(m));
    let primaryMode: TutorSearchMode | null = null;
    if (hasOnline && hasPhysical) primaryMode = "HYBRID";
    else if (hasOnline) primaryMode = "ONLINE";
    else if (hasPhysical) primaryMode = "OFFLINE";

    const isVerified = REQUIRED_VERIFICATION_TYPES.every((type) =>
      (t.verificationChecks ?? []).some(
        (c: any) => c.type === type && c.status === "APPROVED",
      ),
    );

    return {
      id: t.id,
      userId: t.userId,
      displayName: t.user?.displayName ?? null,
      headline: t.headline,
      city: t.city,
      locality: t.locality,
      gender: t.gender,
      experienceYears: t.experienceYears,
      averageRating: t.averageRating?.toString() ?? "0",
      reviewCount: t.reviewCount,
      completedClassesCount: t.completedClassesCount,
      baseHourlyRate: t.baseHourlyRate?.toString() ?? null,
      currency: t.currency,
      isVerified,
      primaryMode,
      lowestHourlyRate: lowest != null ? lowest.toString() : null,
      subjectCount: subjects.length,
      subjects: subjectSummaries,
    };
  }
}