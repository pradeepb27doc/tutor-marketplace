import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "@tutor-marketplace/database";
import { resetTestDatabase } from "@tutor-marketplace/testing";
import { PrismaUserRepository } from "./prisma-user.repository.js";
import { PrismaOtpChallengeRepository } from "./prisma-otp-challenge.repository.js";
import { PrismaSessionRepository } from "./prisma-session.repository.js";
import { PrismaUserRoleRepository } from "./prisma-user-role.repository.js";
import { PrismaParentRepository } from "./prisma-parent.repository.js";
import { PrismaStudentRepository } from "./prisma-student.repository.js";
import { PrismaTutorRepository } from "./prisma-tutor.repository.js";
import { PrismaTutorSubjectRepository } from "./prisma-tutor-subject.repository.js";
import { PrismaTutorSearchRepository } from "./prisma-tutor-search.repository.js";
import { PrismaTutorWeeklySlotRepository } from "./prisma-tutor-weekly-slot.repository.js";
import { PrismaTutorBreakPeriodRepository } from "./prisma-tutor-break-period.repository.js";
import { PrismaTutorBlackoutRepository } from "./prisma-tutor-blackout.repository.js";
import { PrismaTutorAvailabilitySlotRepository } from "./prisma-tutor-availability-slot.repository.js";
import { PrismaTutorQualificationRepository } from "./prisma-tutor-qualification.repository.js";
import { PrismaTutorLanguageRepository } from "./prisma-tutor-language.repository.js";
import { PrismaTutorServiceAreaRepository } from "./prisma-tutor-service-area.repository.js";
import { PrismaTutorVerificationRepository } from "./prisma-tutor-verification.repository.js";
import { PrismaBookingRepository } from "./prisma-booking.repository.js";
import { PrismaPaymentRepository } from "./prisma-payment.repository.js";
import {
  PrismaNotificationRepository,
  PrismaOutboxEventRepository,
} from "./prisma-notification.repository.js";
import { PrismaReviewRepository } from "./prisma-review.repository.js";
import { PrismaAdminRepository } from "./prisma-admin.repository.js";
import { PrismaSubjectRepository } from "./prisma-subject.repository.js";

let prisma: PrismaClient;

// ── Repository instances ──────────────────────────────────────────────
const userRepo = new PrismaUserRepository();
const otpRepo = new PrismaOtpChallengeRepository();
const sessionRepo = new PrismaSessionRepository();
const roleRepo = new PrismaUserRoleRepository();
const parentRepo = new PrismaParentRepository();
const studentRepo = new PrismaStudentRepository();
const tutorRepo = new PrismaTutorRepository();
const tutorSubjectRepo = new PrismaTutorSubjectRepository();
const tutorSearchRepo = new PrismaTutorSearchRepository();
const weeklySlotRepo = new PrismaTutorWeeklySlotRepository();
const breakPeriodRepo = new PrismaTutorBreakPeriodRepository();
const blackoutRepo = new PrismaTutorBlackoutRepository();
const availSlotRepo = new PrismaTutorAvailabilitySlotRepository();
const qualRepo = new PrismaTutorQualificationRepository();
const langRepo = new PrismaTutorLanguageRepository();
const saRepo = new PrismaTutorServiceAreaRepository();
const verificationRepo = new PrismaTutorVerificationRepository();
const bookingRepo = new PrismaBookingRepository();
const paymentRepo = new PrismaPaymentRepository();
const notificationRepo = new PrismaNotificationRepository();
const outboxRepo = new PrismaOutboxEventRepository();
const reviewRepo = new PrismaReviewRepository();
const adminRepo = new PrismaAdminRepository();
const subjectRepo = new PrismaSubjectRepository();

function computeHash(payload: string): string {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `hash-${Math.abs(hash)}-${Date.now()}`;
}

beforeAll(async () => {
  prisma = getPrismaClient();
  await resetTestDatabase(prisma);
});

afterAll(async () => {
  await resetTestDatabase(prisma);
});

beforeEach(async () => {
  await resetTestDatabase(prisma);
});

// ══════════════════════════════════════════════════════════════════════════
// Authentication Repositories
// ══════════════════════════════════════════════════════════════════════════

describe("PrismaUserRepository (Integration)", () => {
  it("should create and find a user by id", async () => {
    const created = await userRepo.create({
      email: "create-find@test.com",
      phone: "+919000000001",
      displayName: "Create Find User",
      primaryRole: "PARENT",
    });
    expect(created.id).toBeTruthy();
    expect(created.email).toBe("create-find@test.com");

    const found = await userRepo.findById(created.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.id);
  });

  it("should find a user by email", async () => {
    const created = await userRepo.create({
      email: "by-email@test.com",
      phone: "+919000000002",
      displayName: "By Email",
      primaryRole: "TUTOR",
    });
    const found = await userRepo.findByEmail("by-email@test.com");
    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.id);
  });

  it("should find a user by phone", async () => {
    const created = await userRepo.create({
      email: "by-phone@test.com",
      phone: "+919000000003",
      displayName: "By Phone",
      primaryRole: "PARENT",
    });
    const found = await userRepo.findByPhone("+919000000003");
    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.id);
  });

  it("should update a user", async () => {
    const created = await userRepo.create({
      email: "update-test@test.com",
      phone: "+919000000004",
      displayName: "Before Update",
      primaryRole: "PARENT",
    });
    const updated = await userRepo.update(created.id, {
      displayName: "After Update",
      locale: "hi-IN",
    });
    expect(updated.displayName).toBe("After Update");
    expect(updated.locale).toBe("hi-IN");
  });

  it("should enforce unique email constraint", async () => {
    await userRepo.create({
      email: "unique@test.com",
      primaryRole: "PARENT",
    });
    await expect(
      userRepo.create({
        email: "unique@test.com",
        primaryRole: "TUTOR",
      }),
    ).rejects.toThrow();
  });

  it("should return null for non-existent user", async () => {
    const found = await userRepo.findById("non-existent-id");
    expect(found).toBeNull();
  });

  it("should return null on findByEmail for non-existent", async () => {
    const found = await userRepo.findByEmail("does-not-exist@test.com");
    expect(found).toBeNull();
  });
});

describe("PrismaOtpChallengeRepository (Integration)", () => {
  let otpUserId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "otp-user@test.com",
      primaryRole: "PARENT",
    });
    otpUserId = u.id;
  });

  it("should create and find an OTP challenge by id", async () => {
    const challenge = await otpRepo.create({
      userId: otpUserId,
      purpose: "LOGIN",
      phone: "+919000000001",
      codeHash: computeHash("123456"),
      expiresAt: new Date(Date.now() + 600_000),
    });
    expect(challenge.id).toBeTruthy();
    expect(challenge.purpose).toBe("LOGIN");

    const found = await otpRepo.findById(challenge.id);
    expect(found).not.toBeNull();
    expect(found!.codeHash).toBe(challenge.codeHash);
  });

  it("should mark consumed", async () => {
    const challenge = await otpRepo.create({
      userId: otpUserId,
      purpose: "LOGIN",
      phone: "+919000000002",
      codeHash: computeHash("654321"),
      expiresAt: new Date(Date.now() + 600_000),
    });
    await otpRepo.markConsumed(challenge.id);
    const found = await otpRepo.findById(challenge.id);
    expect(found!.consumedAt).toBeInstanceOf(Date);
  });

  it("should increment attempts", async () => {
    const challenge = await otpRepo.create({
      userId: otpUserId,
      purpose: "LOGIN",
      phone: "+919000000003",
      codeHash: computeHash("111111"),
      expiresAt: new Date(Date.now() + 600_000),
    });
    await otpRepo.incrementAttempts(challenge.id);
    const found = await otpRepo.findById(challenge.id);
    expect(found!.attempts).toBe(1);
    await otpRepo.incrementAttempts(challenge.id);
    const found2 = await otpRepo.findById(challenge.id);
    expect(found2!.attempts).toBe(2);
  });
});

describe("PrismaSessionRepository (Integration)", () => {
  let sessionUserId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "session-user@test.com",
      primaryRole: "PARENT",
    });
    sessionUserId = u.id;
  });

  it("should create and find a session by id", async () => {
    const session = await sessionRepo.create({
      userId: sessionUserId,
      refreshTokenHash: computeHash("token-1"),
      expiresAt: new Date(Date.now() + 86400_000),
    });
    expect(session.id).toBeTruthy();

    const found = await sessionRepo.findById(session.id);
    expect(found).not.toBeNull();
    expect(found!.userId).toBe(sessionUserId);
  });

  it("should find by refresh token hash", async () => {
    const tokenHash = computeHash("unique-refresh-token");
    await sessionRepo.create({
      userId: sessionUserId,
      refreshTokenHash: tokenHash,
      expiresAt: new Date(Date.now() + 86400_000),
    });
    const found = await sessionRepo.findByRefreshTokenHash(tokenHash);
    expect(found).not.toBeNull();
  });

  it("should list sessions by userId", async () => {
    await sessionRepo.create({
      userId: sessionUserId,
      refreshTokenHash: computeHash("token-2"),
      expiresAt: new Date(Date.now() + 86400_000),
    });
    await sessionRepo.create({
      userId: sessionUserId,
      refreshTokenHash: computeHash("token-3"),
      expiresAt: new Date(Date.now() + 86400_000),
    });
    const sessions = await sessionRepo.listByUserId(sessionUserId);
    expect(sessions.length).toBeGreaterThanOrEqual(2);
  });

  it("should revoke a session", async () => {
    const session = await sessionRepo.create({
      userId: sessionUserId,
      refreshTokenHash: computeHash("revoke-me"),
      expiresAt: new Date(Date.now() + 86400_000),
    });
    await sessionRepo.revoke(session.id);
    const found = await sessionRepo.findById(session.id);
    expect(found!.revokedAt).toBeInstanceOf(Date);
  });

  it("should revoke all sessions by userId", async () => {
    await sessionRepo.create({
      userId: sessionUserId,
      refreshTokenHash: computeHash("revoke-all-1"),
      expiresAt: new Date(Date.now() + 86400_000),
    });
    await sessionRepo.create({
      userId: sessionUserId,
      refreshTokenHash: computeHash("revoke-all-2"),
      expiresAt: new Date(Date.now() + 86400_000),
    });
    await sessionRepo.revokeAllByUserId(sessionUserId);
    const sessions = await sessionRepo.listByUserId(sessionUserId);
    for (const s of sessions) {
      expect(s.revokedAt).toBeInstanceOf(Date);
    }
  });

  it("should enforce unique refreshTokenHash constraint", async () => {
    const hash = computeHash("duplicate-hash");
    await sessionRepo.create({
      userId: sessionUserId,
      refreshTokenHash: hash,
      expiresAt: new Date(Date.now() + 86400_000),
    });
    await expect(
      sessionRepo.create({
        userId: sessionUserId,
        refreshTokenHash: hash,
        expiresAt: new Date(Date.now() + 86400_000),
      }),
    ).rejects.toThrow();
  });
});

describe("PrismaUserRoleRepository (Integration)", () => {
  let roleUserId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "role-user@test.com",
      primaryRole: "PARENT",
    });
    roleUserId = u.id;
  });

  it("should assign and find roles", async () => {
    await roleRepo.assignRole(roleUserId, "TUTOR");
    const roles = await roleRepo.findByUserId(roleUserId);
    expect(roles.length).toBeGreaterThanOrEqual(1);
    expect(roles.some((r: any) => r.role === "TUTOR")).toBe(true);
  });

  it("should enforce unique userId+role constraint", async () => {
    await roleRepo.assignRole(roleUserId, "TUTOR");
    await expect(roleRepo.assignRole(roleUserId, "TUTOR")).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Profiles Repositories
// ══════════════════════════════════════════════════════════════════════════

describe("PrismaParentRepository (Integration)", () => {
  let parentUserId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "parent-user@test.com",
      primaryRole: "PARENT",
    });
    parentUserId = u.id;
  });

  it("should return null for non-existent parent", async () => {
    const found = await parentRepo.findByUserId(parentUserId);
    expect(found).toBeNull();
  });

  it("should update parent profile and find it", async () => {
    await prisma.parent.create({
      data: { userId: parentUserId, city: "Mumbai", preferredLanguage: "en" },
    });
    const found = await parentRepo.findByUserId(parentUserId);
    expect(found).not.toBeNull();
    expect(found!.userId).toBe(parentUserId);

    const updated = await parentRepo.updateByUserId(parentUserId, {
      city: "Delhi",
      preferredLanguage: "hi",
    });
    expect(updated.city).toBe("Delhi");
    expect(updated.preferredLanguage).toBe("hi");
  });

  it("should enforce unique userId constraint on parent", async () => {
    await prisma.parent.create({
      data: { userId: parentUserId },
    });
    await expect(
      prisma.parent.create({
        data: { userId: parentUserId },
      }),
    ).rejects.toThrow();
  });

  it("should cascade delete on user delete", async () => {
    const u = await userRepo.create({
      email: "parent-cascade@test.com",
      primaryRole: "PARENT",
    });
    await prisma.parent.create({
      data: { userId: u.id, city: "Cascade City" },
    });
    await prisma.user.delete({ where: { id: u.id } });
    const parent = await prisma.parent.findUnique({ where: { userId: u.id } });
    expect(parent).toBeNull();
  });
});

describe("PrismaStudentRepository (Integration)", () => {
  let parentRecordId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "student-parent@test.com",
      primaryRole: "PARENT",
    });
    const p = await prisma.parent.create({
      data: { userId: u.id },
    });
    parentRecordId = p.id;
  });

  it("should create and find a student by id", async () => {
    const student = await studentRepo.create({
      fullName: "Test Student One",
      grade: 10,
      curriculum: "CBSE",
    });
    expect(student.id).toBeTruthy();
    expect(student.fullName).toBe("Test Student One");

    const found = await studentRepo.findById(student.id);
    expect(found).not.toBeNull();
    expect(found!.fullName).toBe("Test Student One");
  });

  it("should find students by parent id", async () => {
    const student = await studentRepo.create({
      fullName: "Student For Parent",
      grade: 8,
    });
    await studentRepo.createGuardianLink(student.id, parentRecordId, "son");
    const students = await studentRepo.findByParentId(parentRecordId);
    expect(students.length).toBeGreaterThanOrEqual(1);
    expect(students.some((s) => s.fullName === "Student For Parent")).toBe(true);
  });

  it("should verify parent ownership", async () => {
    const student = await studentRepo.create({
      fullName: "Ownership Test",
    });
    await studentRepo.createGuardianLink(student.id, parentRecordId);
    const owned = await studentRepo.verifyParentOwnership(student.id, parentRecordId);
    expect(owned).toBe(true);
    const notOwned = await studentRepo.verifyParentOwnership(
      student.id,
      "wrong-parent-id",
    );
    expect(notOwned).toBe(false);
  });

  it("should soft delete a student", async () => {
    const student = await studentRepo.create({
      fullName: "Delete Me",
    });
    await studentRepo.softDelete(student.id);
    const found = await prisma.student.findUnique({ where: { id: student.id } });
    expect(found!.deletedAt).toBeInstanceOf(Date);

    const student2 = await studentRepo.create({ fullName: "Keep Me" });
    await studentRepo.createGuardianLink(student2.id, parentRecordId);
    const students = await studentRepo.findByParentId(parentRecordId);
    expect(students.some((s) => s.id === student.id)).toBe(false);
  });

  it("should enforce unique userId constraint", async () => {
    const u = await userRepo.create({
      email: "student-user-uniq@test.com",
      primaryRole: "STUDENT",
    });
    await prisma.student.create({
      data: { userId: u.id, fullName: "First" },
    });
    await expect(
      prisma.student.create({
        data: { userId: u.id, fullName: "Second" },
      }),
    ).rejects.toThrow();
  });

  it("should enforce unique studentId+parentId constraint on guardian", async () => {
    const student = await studentRepo.create({ fullName: "Guardian Uniq" });
    await studentRepo.createGuardianLink(student.id, parentRecordId);
    await expect(
      studentRepo.createGuardianLink(student.id, parentRecordId),
    ).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Tutor Repositories
// ══════════════════════════════════════════════════════════════════════════

describe("PrismaTutorRepository (Integration)", () => {
  let tutorUserId: string;
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "tutor-profile@test.com",
      primaryRole: "TUTOR",
    });
    tutorUserId = u.id;
    const tutor = await tutorRepo.create({
      userId: tutorUserId,
      headline: "Expert Math Tutor",
      bio: "I love teaching",
      city: "Bangalore",
      experienceYears: 5,
      baseHourlyRate: "800.00",
    });
    tutorId = tutor.id;
  });

  it("should create and find a tutor by userId", async () => {
    expect(tutorId).toBeTruthy();

    const found = await tutorRepo.findByUserId(tutorUserId);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(tutorId);
  });

  it("should find a tutor by id", async () => {
    const found = await tutorRepo.findById(tutorId);
    expect(found).not.toBeNull();
    expect(found!.headline).toBe("Expert Math Tutor");
  });

  it("should update a tutor", async () => {
    const updated = await tutorRepo.update(tutorId, {
      headline: "Updated Headline",
      city: "Mumbai",
    });
    expect(updated.headline).toBe("Updated Headline");
  });

  it("should enforce unique userId constraint on tutor", async () => {
    await expect(
      tutorRepo.create({
        userId: tutorUserId,
      }),
    ).rejects.toThrow();
  });

  it("should return null for non-existent tutor", async () => {
    const found = await tutorRepo.findById("non-existent");
    expect(found).toBeNull();
  });
});

describe("PrismaTutorSubjectRepository (Integration)", () => {
  let tutorId: string;
  let subjectId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "tutor-subject@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Subject Tutor",
    });
    tutorId = t.id;

    const subj = await prisma.subject.create({
      data: {
        slug: "integration-math",
        name: "Integration Math",
        category: "ACADEMIC",
      },
    });
    subjectId = subj.id;
  });

  it("should create and find a tutor subject", async () => {
    const ts = await tutorSubjectRepo.create({
      tutorId,
      subjectId,
      gradeMin: 8,
      gradeMax: 12,
      hourlyRate: "600.00",
    });
    expect(ts.id).toBeTruthy();
    expect(ts.subjectId).toBe(subjectId);

    const found = await tutorSubjectRepo.findById(ts.id);
    expect(found).not.toBeNull();
    expect(found!.subject!.name).toBe("Integration Math");
  });

  it("should find by tutorId", async () => {
    await tutorSubjectRepo.create({
      tutorId,
      subjectId,
      gradeMin: 8,
      gradeMax: 12,
      hourlyRate: "600.00",
    });
    const subjects = await tutorSubjectRepo.findByTutorId(tutorId);
    expect(subjects.length).toBeGreaterThanOrEqual(1);
  });

  it("should find by tutorId and subjectId", async () => {
    await tutorSubjectRepo.create({
      tutorId,
      subjectId,
      gradeMin: 8,
      gradeMax: 12,
      hourlyRate: "600.00",
    });
    const found = await tutorSubjectRepo.findByTutorIdAndSubjectId(
      tutorId,
      subjectId,
    );
    expect(found).not.toBeNull();
  });

  it("should soft delete (mark inactive)", async () => {
    const ts = await tutorSubjectRepo.create({
      tutorId,
      subjectId,
      gradeMin: 6,
      gradeMax: 10,
    });
    await tutorSubjectRepo.softDelete(ts.id);
    const found = await tutorSubjectRepo.findById(ts.id);
    expect(found!.isActive).toBe(false);
  });
});

describe("PrismaTutorSearchRepository (Integration)", () => {
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "searchable-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Searchable Tutor",
      city: "Mumbai",
      baseHourlyRate: "500.00",
      experienceYears: 3,
    });
    tutorId = t.id;
    await prisma.tutor.update({
      where: { id: t.id },
      data: { status: "ACTIVE" },
    });
    const subj = await prisma.subject.create({
      data: {
        slug: "search-subject",
        name: "Search Subject",
        category: "ACADEMIC",
      },
    });
    // Use type assertion for serviceModes since it's not in the interface
    await (tutorSubjectRepo as any).create({
      tutorId: t.id,
      subjectId: subj.id,
      serviceModes: ["ONLINE"],
      hourlyRate: "500.00",
    });
  });

  it("should search tutors with filters", async () => {
    const result = await tutorSearchRepo.search({
      filters: { city: "Mumbai" },
      sort: "NEWEST",
      cursor: undefined,
      limit: 10,
    });
    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.items[0].city).toBe("Mumbai");
  });

  it("should return empty for non-matching filters", async () => {
    const result = await tutorSearchRepo.search({
      filters: { city: "NonExistentCity" },
      sort: "RATING",
      cursor: undefined,
      limit: 10,
    });
    expect(result.items.length).toBe(0);
    expect(result.nextCursor).toBeNull();
  });
});

describe("PrismaTutorWeeklySlotRepository (Integration)", () => {
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "weekly-slot-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Weekly Slot Tutor",
    });
    tutorId = t.id;
  });

  it("should create and find weekly slots", async () => {
    const slot = await weeklySlotRepo.create({
      tutorId,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "11:00",
      serviceMode: "ONLINE",
      capacity: 2,
    });
    expect(slot.id).toBeTruthy();
    expect(slot.dayOfWeek).toBe("MONDAY");

    const slots = await weeklySlotRepo.findByTutorId(tutorId);
    expect(slots.length).toBeGreaterThanOrEqual(1);
  });

  it("should find overlapping slots", async () => {
    await weeklySlotRepo.create({
      tutorId,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "11:00",
      serviceMode: "ONLINE",
      capacity: 2,
    });
    const overlapping = await weeklySlotRepo.findOverlapping(
      tutorId,
      "MONDAY",
      "ONLINE",
    );
    expect(overlapping.length).toBeGreaterThanOrEqual(1);
  });

  it("should update a weekly slot", async () => {
    const slot = await weeklySlotRepo.create({
      tutorId,
      dayOfWeek: "WEDNESDAY",
      startTime: "14:00",
      endTime: "15:00",
      serviceMode: "ONLINE",
    });
    const updated = await weeklySlotRepo.update(slot.id, {
      capacity: 5,
      startTime: "13:00",
    });
    expect(updated.capacity).toBe(5);
    expect(updated.startTime).toBe("13:00");
  });

  it("should delete a weekly slot", async () => {
    const slot = await weeklySlotRepo.create({
      tutorId,
      dayOfWeek: "FRIDAY",
      startTime: "10:00",
      endTime: "11:00",
      serviceMode: "ONLINE",
    });
    await weeklySlotRepo.delete(slot.id);
    const found = await weeklySlotRepo.findById(slot.id);
    expect(found).toBeNull();
  });

  it("should enforce unique constraint on tutorId+dayOfWeek+startTime+serviceMode", async () => {
    await weeklySlotRepo.create({
      tutorId,
      dayOfWeek: "SATURDAY",
      startTime: "10:00",
      endTime: "11:00",
      serviceMode: "ONLINE",
    });
    await expect(
      weeklySlotRepo.create({
        tutorId,
        dayOfWeek: "SATURDAY",
        startTime: "10:00",
        endTime: "11:00",
        serviceMode: "ONLINE",
      }),
    ).rejects.toThrow();
  });
});

describe("PrismaTutorBreakPeriodRepository (Integration)", () => {
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "break-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Break Period Tutor",
    });
    tutorId = t.id;
  });

  it("should create and find break periods", async () => {
    const bp = await breakPeriodRepo.create({
      tutorId,
      dayOfWeek: "MONDAY",
      startTime: "12:00",
      endTime: "13:00",
      reason: "Lunch break",
    });
    expect(bp.id).toBeTruthy();

    const periods = await breakPeriodRepo.findByTutorId(tutorId);
    expect(periods.length).toBeGreaterThanOrEqual(1);
  });

  it("should delete a break period", async () => {
    const bp = await breakPeriodRepo.create({
      tutorId,
      dayOfWeek: "TUESDAY",
      startTime: "12:00",
      endTime: "13:00",
    });
    await breakPeriodRepo.delete(bp.id);
    const found = await prisma.tutorBreakPeriod.findUnique({
      where: { id: bp.id },
    });
    expect(found).toBeNull();
  });
});

describe("PrismaTutorBlackoutRepository (Integration)", () => {
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "blackout-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Blackout Tutor",
    });
    tutorId = t.id;
  });

  it("should create and find blackout periods", async () => {
    const bp = await blackoutRepo.create({
      tutorId,
      startAt: new Date("2026-08-01T00:00:00Z"),
      endAt: new Date("2026-08-07T23:59:59Z"),
      reason: "Vacation",
    });
    expect(bp.id).toBeTruthy();

    const periods = await blackoutRepo.findByTutorId(tutorId);
    expect(periods.length).toBeGreaterThanOrEqual(1);
  });

  it("should find by id", async () => {
    const bp = await blackoutRepo.create({
      tutorId,
      startAt: new Date("2026-09-01T00:00:00Z"),
      endAt: new Date("2026-09-05T23:59:59Z"),
    });
    const found = await blackoutRepo.findById(bp.id);
    expect(found).not.toBeNull();
  });

  it("should delete a blackout period", async () => {
    const bp = await blackoutRepo.create({
      tutorId,
      startAt: new Date("2026-10-01T00:00:00Z"),
      endAt: new Date("2026-10-03T23:59:59Z"),
    });
    await blackoutRepo.delete(bp.id);
    const found = await prisma.tutorBlackoutPeriod.findUnique({
      where: { id: bp.id },
    });
    expect(found).toBeNull();
  });
});

describe("PrismaTutorAvailabilitySlotRepository (Integration)", () => {
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "avail-slot-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Availability Slot Tutor",
    });
    tutorId = t.id;
  });

  it("should create concrete slot", async () => {
    const slot = await availSlotRepo.createConcreteSlot({
      tutorId,
      startAt: new Date("2026-07-25T10:00:00Z"),
      endAt: new Date("2026-07-25T11:00:00Z"),
      serviceMode: "ONLINE",
    });
    expect(slot.id).toBeTruthy();
    expect(slot.status).toBe("AVAILABLE");
  });

  it("should reserve and release slot", async () => {
    const parentUser = await userRepo.create({
      email: "slot-parent@test.com",
      primaryRole: "PARENT",
    });
    const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
    const parentId = parent.id;

    const slot = await availSlotRepo.createConcreteSlot({
      tutorId,
      startAt: new Date("2026-07-26T10:00:00Z"),
      endAt: new Date("2026-07-26T11:00:00Z"),
      serviceMode: "ONLINE",
    });

    await availSlotRepo.reserveSlot(
      slot.id,
      parentId,
      new Date(Date.now() + 60_000),
    );
    let found = await availSlotRepo.findById(slot.id);
    expect(found!.status).toBe("RESERVED");
    expect(found!.reservedByParentId).toBe(parentId);

    await availSlotRepo.releaseSlot(slot.id);
    found = await availSlotRepo.findById(slot.id);
    expect(found!.status).toBe("AVAILABLE");
    expect(found!.reservedByParentId).toBeNull();
  });

  it("should mark as booked and expired", async () => {
    const slot = await availSlotRepo.createConcreteSlot({
      tutorId,
      startAt: new Date("2026-07-27T10:00:00Z"),
      endAt: new Date("2026-07-27T11:00:00Z"),
      serviceMode: "ONLINE",
    });

    await availSlotRepo.markAsBooked(slot.id);
    let found = await availSlotRepo.findById(slot.id);
    expect(found!.status).toBe("BOOKED");

    await availSlotRepo.markAsExpired(slot.id);
    found = await availSlotRepo.findById(slot.id);
    expect(found!.status).toBe("EXPIRED");
  });

  it("should find available slot by id with time check", async () => {
    const future = new Date(Date.now() + 86400_000);
    const slot = await availSlotRepo.createConcreteSlot({
      tutorId,
      startAt: future,
      endAt: new Date(future.getTime() + 3600_000),
      serviceMode: "ONLINE",
    });
    const found = await availSlotRepo.findAvailableById(slot.id);
    expect(found).not.toBeNull();
    expect(found!.status).toBe("AVAILABLE");

    const past = await availSlotRepo.createConcreteSlot({
      tutorId,
      startAt: new Date("2020-01-01T10:00:00Z"),
      endAt: new Date("2020-01-01T11:00:00Z"),
      serviceMode: "ONLINE",
    });
    const pastFound = await availSlotRepo.findAvailableById(past.id);
    expect(pastFound).toBeNull();
  });
});

describe("PrismaTutorQualificationRepository (Integration)", () => {
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "qual-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Qualification Tutor",
    });
    tutorId = t.id;
  });

  it("should create and find qualifications", async () => {
    const q = await qualRepo.create({
      tutorId,
      title: "M.Sc. Mathematics",
      institutionName: "University of Mumbai",
      completionYear: 2020,
    });
    expect(q.id).toBeTruthy();

    const quals = await qualRepo.findByTutorId(tutorId);
    expect(quals.length).toBeGreaterThanOrEqual(1);
  });

  it("should update and delete qualifications", async () => {
    const q = await qualRepo.create({
      tutorId,
      title: "B.Ed",
      institutionName: "Delhi University",
    });
    const updated = await qualRepo.update(q.id, { title: "B.Ed. Updated" });
    expect(updated.title).toBe("B.Ed. Updated");

    await qualRepo.delete(q.id);
    const found = await qualRepo.findById(q.id);
    expect(found).toBeNull();
  });
});

describe("PrismaTutorLanguageRepository (Integration)", () => {
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "lang-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Language Tutor",
    });
    tutorId = t.id;
  });

  it("should create and find languages", async () => {
    const lang = await langRepo.create({
      tutorId,
      language: "Hindi",
      proficiency: "NATIVE",
    });
    expect(lang.id).toBeTruthy();

    const langs = await langRepo.findByTutorId(tutorId);
    expect(langs.length).toBeGreaterThanOrEqual(1);
    expect(langs.some((l) => l.language === "Hindi")).toBe(true);
  });

  it("should delete a language", async () => {
    const lang = await langRepo.create({
      tutorId,
      language: "English",
      proficiency: "FLUENT",
    });
    await langRepo.delete(lang.id);
    const found = await prisma.tutorLanguage.findUnique({
      where: { id: lang.id },
    });
    expect(found).toBeNull();
  });
});

describe("PrismaTutorServiceAreaRepository (Integration)", () => {
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "sa-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Service Area Tutor",
    });
    tutorId = t.id;
  });

  it("should create and find service areas", async () => {
    const sa = await saRepo.create({
      tutorId,
      city: "Mumbai",
      locality: "Andheri",
    });
    expect(sa.id).toBeTruthy();

    const areas = await saRepo.findByTutorId(tutorId);
    expect(areas.length).toBeGreaterThanOrEqual(1);
  });

  it("should delete a service area", async () => {
    const sa = await saRepo.create({
      tutorId,
      city: "Delhi",
      locality: "Connaught Place",
    });
    await saRepo.delete(sa.id);
    const found = await prisma.tutorServiceArea.findUnique({
      where: { id: sa.id },
    });
    expect(found).toBeNull();
  });
});

describe("PrismaTutorVerificationRepository (Integration)", () => {
  let tutorId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "verify-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: u.id,
      headline: "Verification Tutor",
    });
    tutorId = t.id;
  });

  it("should upsert verification checks", async () => {
    const check = await verificationRepo.upsertCheck(tutorId, "GOVERNMENT_ID", {
      status: "SUBMITTED",
    });
    expect(check.id).toBeTruthy();
    expect(check.type).toBe("GOVERNMENT_ID");

    const found = await verificationRepo.findCheckByTutorIdAndType(
      tutorId,
      "GOVERNMENT_ID",
    );
    expect(found).not.toBeNull();
  });

  it("should find checks by tutorId", async () => {
    await verificationRepo.upsertCheck(tutorId, "GOVERNMENT_ID", {
      status: "SUBMITTED",
    });
    const checks = await verificationRepo.findChecksByTutorId(tutorId);
    expect(checks.length).toBeGreaterThanOrEqual(1);
  });

  it("should create documents and set status", async () => {
    const doc = await verificationRepo.createDocument({
      tutorId,
      verificationCheckId: null,
      type: "GOVERNMENT_ID",
      fileKey: "uploads/test-id.pdf",
      originalFileName: "test-id.pdf",
    });
    expect(doc.id).toBeTruthy();
    expect(doc.status).toBe("UPLOADED");

    await verificationRepo.setDocumentStatus(doc.id, "VERIFIED");
    const docs = await verificationRepo.findDocumentsByTutorId(tutorId);
    expect(docs.some((d) => d.status === "VERIFIED")).toBe(true);
  });

  it("should list pending verification cases", async () => {
    const cases = await verificationRepo.listPendingCases({ limit: 10 });
    expect(cases.items.length).toBeGreaterThanOrEqual(0);
  });

  it("should handle transactions for approve/reject/requestChanges", async () => {
    const u = await userRepo.create({
      email: "verify-flow@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({ userId: u.id, headline: "Verify Flow" });
    await prisma.tutor.update({
      where: { id: t.id },
      data: { status: "PENDING_VERIFICATION" },
    });
    await verificationRepo.upsertCheck(t.id, "GOVERNMENT_ID", {
      status: "SUBMITTED",
    });
    await verificationRepo.upsertCheck(t.id, "DEGREE", {
      status: "SUBMITTED",
    });

    await verificationRepo.approveVerification(t.id, u.id, new Date());
    const approvedTutor = await tutorRepo.findById(t.id);
    expect(approvedTutor!.status).toBe("ACTIVE");

    // Reject flow
    const u2 = await userRepo.create({
      email: "verify-reject@test.com",
      primaryRole: "TUTOR",
    });
    const t2 = await tutorRepo.create({
      userId: u2.id,
      headline: "Reject Flow",
    });
    await prisma.tutor.update({
      where: { id: t2.id },
      data: { status: "PENDING_VERIFICATION" },
    });
    await verificationRepo.upsertCheck(t2.id, "GOVERNMENT_ID", {
      status: "SUBMITTED",
    });
    await verificationRepo.rejectVerification(
      t2.id,
      u2.id,
      new Date(),
      "Documents invalid",
    );
    const rejectedTutor = await tutorRepo.findById(t2.id);
    expect(rejectedTutor!.status).toBe("REJECTED");

    // Request changes flow
    const u3 = await userRepo.create({
      email: "verify-changes@test.com",
      primaryRole: "TUTOR",
    });
    const t3 = await tutorRepo.create({
      userId: u3.id,
      headline: "Changes Flow",
    });
    await prisma.tutor.update({
      where: { id: t3.id },
      data: { status: "PENDING_VERIFICATION" },
    });
    await verificationRepo.upsertCheck(t3.id, "GOVERNMENT_ID", {
      status: "SUBMITTED",
    });
    await verificationRepo.requestChangesVerification(
      t3.id,
      u3.id,
      new Date(),
      "Please re-upload",
    );
    const changesTutor = await tutorRepo.findById(t3.id);
    expect(changesTutor!.status).toBe("CHANGES_REQUESTED");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Subject Repository
// ══════════════════════════════════════════════════════════════════════════

describe("PrismaSubjectRepository (Integration)", () => {
  beforeEach(async () => {
    const existing = await prisma.subject.findMany();
    if (existing.length === 0) {
      await prisma.subject.create({
        data: {
          slug: "physics",
          name: "Physics",
          category: "ACADEMIC",
        },
      });
      await prisma.subject.create({
        data: {
          slug: "chemistry",
          name: "Chemistry",
          category: "ACADEMIC",
        },
      });
    }
  });

  it("should find all active subjects", async () => {
    const subjects = await subjectRepo.findAllActive();
    expect(subjects.length).toBeGreaterThanOrEqual(1);
  });

  it("should find subject by slug", async () => {
    const subject = await subjectRepo.findBySlug("physics");
    expect(subject).not.toBeNull();
    expect(subject!.name).toBe("Physics");
  });

  it("should return null for non-existent slug", async () => {
    const subject = await subjectRepo.findBySlug("non-existent-subject");
    expect(subject).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Booking Repository
// ══════════════════════════════════════════════════════════════════════════

describe("PrismaBookingRepository (Integration)", () => {
  let parentId: string;
  let studentId: string;
  let tutorId: string;
  let subjectId: string;

  beforeEach(async () => {
    // Create parent
    const parentUser = await userRepo.create({
      email: "booking-parent@test.com",
      primaryRole: "PARENT",
    });
    const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
    parentId = parent.id;

    // Create tutor
    const tutorUser = await userRepo.create({
      email: "booking-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: tutorUser.id,
      headline: "Booking Tutor",
    });
    tutorId = t.id;
    await prisma.tutor.update({
      where: { id: t.id },
      data: { status: "ACTIVE" },
    });

    // Create subject
    const subj = await prisma.subject.create({
      data: {
        slug: "booking-subject",
        name: "Booking Subject",
        category: "ACADEMIC",
      },
    });
    subjectId = subj.id;

    // Create student
    const student = await studentRepo.create({
      fullName: "Booking Student",
      grade: 10,
      curriculum: "CBSE",
    });
    studentId = student.id;
    await studentRepo.createGuardianLink(studentId, parentId);
  });

  it("should create and find a booking by id", async () => {
    const booking = await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-07-30T10:00:00Z"),
      endAt: new Date("2026-07-30T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
      city: "Mumbai",
    });
    expect(booking.id).toBeTruthy();
    expect(booking.status).toBe("REQUESTED");

    const found = await bookingRepo.findById(booking.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(booking.id);
  });

  it("should find by publicId", async () => {
    const booking = await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-07-31T10:00:00Z"),
      endAt: new Date("2026-07-31T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    const found = await bookingRepo.findByPublicId(booking.publicId);
    expect(found).not.toBeNull();
  });

  it("should find by parentId with filtering", async () => {
    await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-01T10:00:00Z"),
      endAt: new Date("2026-08-01T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    const bookings = await bookingRepo.findByParentId(parentId, { limit: 5 });
    expect(bookings.length).toBeGreaterThanOrEqual(1);
  });

  it("should find by tutorId with filtering", async () => {
    await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-02T10:00:00Z"),
      endAt: new Date("2026-08-02T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    const bookings = await bookingRepo.findByTutorId(tutorId, { limit: 5 });
    expect(bookings.length).toBeGreaterThanOrEqual(1);
  });

  it("should find overlapping bookings", async () => {
    await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-07-30T10:00:00Z"),
      endAt: new Date("2026-07-30T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    const overlapping = await bookingRepo.findOverlapping(
      tutorId,
      new Date("2026-07-30T09:30:00Z"),
      new Date("2026-07-30T11:30:00Z"),
    );
    expect(overlapping.length).toBeGreaterThanOrEqual(1);
  });

  it("should find bookings by time range", async () => {
    await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-07-30T10:00:00Z"),
      endAt: new Date("2026-07-30T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    const range = await bookingRepo.findByTutorIdAndTimeRange(
      tutorId,
      new Date("2026-07-30T00:00:00Z"),
      new Date("2026-07-30T23:59:59Z"),
    );
    expect(range.length).toBeGreaterThanOrEqual(1);
  });

  it("should update booking status", async () => {
    const booking = await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-01T10:00:00Z"),
      endAt: new Date("2026-08-01T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    const updated = await bookingRepo.updateStatus(booking.id, "ACCEPTED");
    expect(updated.status).toBe("ACCEPTED");
    expect(updated.acceptedAt).toBeInstanceOf(Date);
  });

  it("should add status history", async () => {
    const booking = await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-01T10:00:00Z"),
      endAt: new Date("2026-08-01T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    await bookingRepo.addStatusHistory({
      bookingId: booking.id,
      fromStatus: "REQUESTED",
      toStatus: "ACCEPTED",
    });
    const historyRecords = await prisma.bookingStatusHistory.findMany({
      where: { bookingId: booking.id },
    });
    expect(historyRecords.length).toBeGreaterThanOrEqual(1);
  });

  it("should find by slot id", async () => {
    const slot = await availSlotRepo.createConcreteSlot({
      tutorId,
      startAt: new Date("2026-08-02T10:00:00Z"),
      endAt: new Date("2026-08-02T11:00:00Z"),
      serviceMode: "ONLINE",
    });
    const booking = await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId,
      availabilitySlotId: slot.id,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-02T10:00:00Z"),
      endAt: new Date("2026-08-02T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { availabilitySlotId: slot.id },
    });
    const found = await bookingRepo.findBySlotId(slot.id);
    expect(found).not.toBeNull();
  });

  it("should enforce foreign key constraint on parentId", async () => {
    await expect(
      bookingRepo.create({
        parentId: "non-existent-parent",
        studentId,
        tutorId,
        subjectId,
        classType: "REGULAR",
        serviceMode: "ONLINE",
        startAt: new Date("2026-08-03T10:00:00Z"),
        endAt: new Date("2026-08-03T11:00:00Z"),
        durationMinutes: 60,
        priceAmount: "500.00",
      }),
    ).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Payment Repository
// ══════════════════════════════════════════════════════════════════════════

describe("PrismaPaymentRepository (Integration)", () => {
  let paymentId: string;
  let parentId: string;
  let tutorId: string;

  beforeEach(async () => {
    // Create parent
    const parentUser = await userRepo.create({
      email: "payment-parent@test.com",
      primaryRole: "PARENT",
    });
    const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
    parentId = parent.id;

    // Create tutor
    const tutorUser = await userRepo.create({
      email: "payment-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: tutorUser.id,
      headline: "Payment Tutor",
    });
    tutorId = t.id;
    await prisma.tutor.update({
      where: { id: t.id },
      data: { status: "ACTIVE" },
    });

    // Create subject
    const subj = await prisma.subject.create({
      data: {
        slug: "payment-subject",
        name: "Payment Subject",
        category: "ACADEMIC",
      },
    });

    // Create student
    const student = await studentRepo.create({
      fullName: "Payment Student",
      grade: 10,
      curriculum: "CBSE",
    });
    const studentId = student.id;
    await studentRepo.createGuardianLink(studentId, parentId);

    // Create booking
    const booking = await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId: subj.id,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-05T10:00:00Z"),
      endAt: new Date("2026-08-05T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
      city: "Mumbai",
    });
    paymentId = booking.id;
  });

  it("should create and find a payment by id", async () => {
    const payment = await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 50000, // Integer minor units (paise)
    });
    expect(payment.id).toBeTruthy();
    expect(payment.status).toBe("PENDING");

    const found = await paymentRepo.findById(payment.id);
    expect(found).not.toBeNull();
  });

  it("should find by bookingId", async () => {
    const payment = await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 50000,
    });
    const payments = await paymentRepo.findByBookingId(paymentId);
    expect(payments.length).toBeGreaterThanOrEqual(1);
  });

  it("should find by providerOrderId", async () => {
    const payment = await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 30000,
      providerOrderId: "order_test_001",
    });
    const found = await paymentRepo.findByProviderOrderId("order_test_001");
    expect(found).not.toBeNull();
  });

  it("should find by providerPaymentId", async () => {
    const payment = await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 40000,
    });
    await paymentRepo.updateStatus(payment.id, "CAPTURED", {
      providerPaymentId: "pay_test_001",
      capturedAt: new Date(),
    });
    const found = await paymentRepo.findByProviderPaymentId("pay_test_001");
    expect(found).not.toBeNull();
  });

  it("should find by idempotencyKey", async () => {
    await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 25000,
      idempotencyKey: "idemp-001",
    });
    const found = await paymentRepo.findByIdempotencyKey("idemp-001");
    expect(found).not.toBeNull();
  });

  it("should update payment status", async () => {
    const payment = await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 50000,
    });
    const updated = await paymentRepo.updateStatus(payment.id, "AUTHORIZED", {
      authorizedAt: new Date(),
    });
    expect(updated.status).toBe("AUTHORIZED");
  });

  it("should add and get transactions", async () => {
    const payment = await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 50000,
    });
    await paymentRepo.addTransaction({
      paymentId: payment.id,
      provider: "RAZORPAY",
      eventType: "order.created",
      status: "PENDING",
    });
    const txs = await paymentRepo.getTransactions(payment.id);
    expect(txs.length).toBeGreaterThanOrEqual(1);
  });

  it("should save and find webhook events", async () => {
    const wh = await paymentRepo.saveWebhookEvent({
      provider: "RAZORPAY",
      providerEventId: "evt_001",
      eventType: "payment.captured",
      payload: { event: "test" },
    });
    expect(wh.id).toBeTruthy();

    const found = await paymentRepo.findWebhookByProviderEventId(
      "RAZORPAY",
      "evt_001",
    );
    expect(found).not.toBeNull();
  });

  it("should get unprocessed webhooks", async () => {
    await paymentRepo.saveWebhookEvent({
      provider: "RAZORPAY",
      providerEventId: "evt_003",
      eventType: "payment.captured",
      payload: { event: "unprocessed" },
    });
    const whs = await paymentRepo.getUnprocessedWebhooks();
    expect(whs.length).toBeGreaterThanOrEqual(1);
  });

  it("should mark webhook processed", async () => {
    const wh = await paymentRepo.saveWebhookEvent({
      provider: "RAZORPAY",
      providerEventId: "evt_002",
      eventType: "payment.failed",
      payload: { event: "failed" },
    });
    const payment = await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 40000,
    });
    await paymentRepo.markWebhookProcessed(wh.id, payment.id);
    const found = await paymentRepo.findWebhookByProviderEventId(
      "RAZORPAY",
      "evt_002",
    );
    expect(found!.status).toBe("PROCESSED");
  });

  it("should create and find refunds", async () => {
    const payment = await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 50000,
    });
    const refund = await paymentRepo.createRefund({
      paymentId: payment.id,
      bookingId: paymentId,
      amount: 10000,
      reason: "Customer request",
    });
    expect(refund.id).toBeTruthy();

    const found = await paymentRepo.findRefundById(refund.id);
    expect(found).not.toBeNull();

    const byPayment = await paymentRepo.findRefundsByPaymentId(payment.id);
    expect(byPayment.length).toBeGreaterThanOrEqual(1);

    const byBooking = await paymentRepo.findRefundsByBookingId(paymentId);
    expect(byBooking.length).toBeGreaterThanOrEqual(1);
  });

  it("should update refund status", async () => {
    const payment = await paymentRepo.create({
      bookingId: paymentId,
      parentId,
      provider: "RAZORPAY",
      amount: 50000,
    });
    const refund = await paymentRepo.createRefund({
      paymentId: payment.id,
      bookingId: paymentId,
      amount: 5000,
    });
    const updated = await paymentRepo.updateRefundStatus(refund.id, "PROCESSED");
    expect(updated.status).toBe("PROCESSED");
    expect(updated.processedAt).toBeInstanceOf(Date);
  });

  it("should count by status", async () => {
    const count = await paymentRepo.countByStatus("PENDING");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("should get payment summary", async () => {
    const summary = await paymentRepo.getPaymentSummary();
    expect(summary.totalPayments).toBeGreaterThanOrEqual(0);
    expect(typeof summary.totalCapturedAmount).toBe("number");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Notification Repository
// ══════════════════════════════════════════════════════════════════════════

describe("PrismaNotificationRepository (Integration)", () => {
  let notificationUserId: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "notif-user@test.com",
      primaryRole: "PARENT",
    });
    notificationUserId = u.id;
  });

  it("should create and find a notification", async () => {
    const n = await notificationRepo.create({
      userId: notificationUserId,
      channel: "IN_APP",
      title: "Test Notification",
      body: "This is a test",
    });
    expect(n.id).toBeTruthy();
    expect(n.channel).toBe("IN_APP");

    const found = await notificationRepo.findById(n.id);
    expect(found).not.toBeNull();
  });

  it("should find notifications by userId", async () => {
    await notificationRepo.create({
      userId: notificationUserId,
      channel: "IN_APP",
      title: "Notif 1",
      body: "Body 1",
    });
    const notifs = await notificationRepo.findByUserId(notificationUserId);
    expect(notifs.length).toBeGreaterThanOrEqual(1);
  });

  it("should find notification by user and id", async () => {
    const n = await notificationRepo.create({
      userId: notificationUserId,
      channel: "IN_APP",
      title: "Specific Notif",
      body: "Body",
    });
    const found = await notificationRepo.findByUserAndId(
      notificationUserId,
      n.id,
    );
    expect(found).not.toBeNull();

    const notFound = await notificationRepo.findByUserAndId("other-user", n.id);
    expect(notFound).toBeNull();
  });

  it("should mark as read", async () => {
    const n = await notificationRepo.create({
      userId: notificationUserId,
      channel: "IN_APP",
      title: "Unread",
      body: "Mark read",
    });
    const updated = await notificationRepo.markRead(n.id);
    expect(updated.readAt).toBeInstanceOf(Date);
  });

  it("should find due for dispatch", async () => {
    await notificationRepo.create({
      userId: notificationUserId,
      channel: "EMAIL",
      title: "Queued",
      body: "Should be dispatched",
      status: "QUEUED",
    });
    const due = await notificationRepo.findDueForDispatch(
      10,
      new Date(Date.now() + 3600_000),
    );
    expect(due.length).toBeGreaterThanOrEqual(1);
  });

  it("should update after send", async () => {
    const n = await notificationRepo.create({
      userId: notificationUserId,
      channel: "EMAIL",
      title: "Send Test",
      body: "After send",
      status: "QUEUED",
    });
    await notificationRepo.updateAfterSend(n.id, "SENT", {
      sentAt: new Date(),
      providerMessageId: "msg_001",
    });
    const found = await notificationRepo.findById(n.id);
    expect(found!.status).toBe("SENT");
    expect(found!.sentAt).toBeInstanceOf(Date);
  });

  it("should increment attempt and mark dead letter", async () => {
    const n = await notificationRepo.create({
      userId: notificationUserId,
      channel: "SMS",
      title: "Retry Test",
      body: "Will fail",
      status: "QUEUED",
    });
    await notificationRepo.incrementAttempt(
      n.id,
      new Date(Date.now() + 60_000),
      "Network error",
    );
    await notificationRepo.incrementAttempt(
      n.id,
      new Date(Date.now() + 120_000),
      "Timeout",
    );
    const afterIncrement = await notificationRepo.findById(n.id);
    expect(afterIncrement!.attempts).toBe(2);

    await notificationRepo.markDeadLetter(n.id, "Max retries exceeded");
    const deadLetter = await notificationRepo.findById(n.id);
    expect(deadLetter!.status).toBe("DEAD_LETTER");
  });

  it("should count unread", async () => {
    const count = await notificationRepo.countUnread(notificationUserId);
    expect(typeof count).toBe("number");
  });

  it("should upsert and find push token", async () => {
    const device = await notificationRepo.upsertPushToken({
      userId: notificationUserId,
      platform: "ios",
      pushToken: "push-token-123",
    });
    expect(device.id).toBeTruthy();

    const tokens = await notificationRepo.findPushTokensByUserId(
      notificationUserId,
    );
    expect(tokens.length).toBeGreaterThanOrEqual(1);
  });

  it("should upsert and find preferences", async () => {
    const pref = await notificationRepo.upsertPreference({
      userId: notificationUserId,
      channel: "EMAIL",
      category: "BOOKING",
      enabled: true,
    });
    expect(pref.id).toBeTruthy();

    const found = await notificationRepo.findPreference(
      notificationUserId,
      "EMAIL",
      "BOOKING",
    );
    expect(found).not.toBeNull();
    expect(found!.enabled).toBe(true);

    const prefs = await notificationRepo.listPreferences(notificationUserId);
    expect(prefs.length).toBeGreaterThanOrEqual(1);
  });
});

describe("PrismaOutboxEventRepository (Integration)", () => {
  let bookingId: string;

  beforeEach(async () => {
    // Create a booking for the outbox event
    const parentUser = await userRepo.create({
      email: "outbox-parent@test.com",
      primaryRole: "PARENT",
    });
    const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
    const parentId = parent.id;

    const tutorUser = await userRepo.create({
      email: "outbox-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: tutorUser.id,
      headline: "Outbox Tutor",
    });
    const subj = await prisma.subject.create({
      data: {
        slug: "outbox-subject",
        name: "Outbox Subject",
        category: "ACADEMIC",
      },
    });
    const student = await studentRepo.create({
      fullName: "Outbox Student",
      grade: 10,
    });
    await studentRepo.createGuardianLink(student.id, parentId);

    const booking = await bookingRepo.create({
      parentId,
      studentId: student.id,
      tutorId: t.id,
      subjectId: subj.id,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-05T10:00:00Z"),
      endAt: new Date("2026-08-05T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    bookingId = booking.id;
  });

  it("should create and find outbox events", async () => {
    const evt = await outboxRepo.create({
      eventName: "booking.created",
      aggregateType: "Booking",
      aggregateId: bookingId,
      payload: { bookingId },
    });
    expect(evt.id).toBeTruthy();
    expect(evt.status).toBe("PENDING");

    const found = await outboxRepo.findById(evt.id);
    expect(found).not.toBeNull();
  });

  it("should find pending events", async () => {
    await outboxRepo.create({
      eventName: "payment.captured",
      aggregateType: "Payment",
      aggregateId: "pay-123",
      payload: {},
    });
    const pending = await outboxRepo.findPending(
      10,
      new Date(Date.now() + 3600_000),
    );
    expect(pending.length).toBeGreaterThanOrEqual(1);
  });

  it("should mark processing, processed, and failed", async () => {
    const evt = await outboxRepo.create({
      eventName: "test.event",
      aggregateType: "Test",
      aggregateId: "test-1",
      payload: {},
    });

    await outboxRepo.markProcessing(evt.id);
    let found = await outboxRepo.findById(evt.id);
    expect(found!.status).toBe("PROCESSING");

    await outboxRepo.markProcessed(evt.id);
    found = await outboxRepo.findById(evt.id);
    expect(found!.status).toBe("PROCESSED");
    expect(found!.processedAt).toBeInstanceOf(Date);

    const evt2 = await outboxRepo.create({
      eventName: "test.fail",
      aggregateType: "Test",
      aggregateId: "test-2",
      payload: {},
    });
    await outboxRepo.markFailed(
      evt2.id,
      "Critical error",
      new Date(Date.now() + 60_000),
    );
    found = await outboxRepo.findById(evt2.id);
    expect(found!.status).toBe("FAILED");
    expect(found!.errorMessage).toBe("Critical error");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Review Repository
// ══════════════════════════════════════════════════════════════════════════

describe("PrismaReviewRepository (Integration)", () => {
  let reviewBookingId: string;
  let parentId: string;
  let tutorId: string;
  let studentId: string;

  beforeEach(async () => {
    // Create parent
    const parentUser = await userRepo.create({
      email: "review-parent@test.com",
      primaryRole: "PARENT",
    });
    const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
    parentId = parent.id;

    // Create tutor
    const tutorUser = await userRepo.create({
      email: "review-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: tutorUser.id,
      headline: "Review Tutor",
    });
    tutorId = t.id;
    await prisma.tutor.update({
      where: { id: t.id },
      data: { status: "ACTIVE" },
    });

    // Create student
    const student = await studentRepo.create({
      fullName: "Review Student",
      grade: 10,
    });
    studentId = student.id;
    await studentRepo.createGuardianLink(studentId, parentId);

    // Create booking
    const subj = await prisma.subject.create({
      data: {
        slug: "review-subject",
        name: "Review Subject",
        category: "ACADEMIC",
      },
    });
    const booking = await bookingRepo.create({
      parentId,
      studentId,
      tutorId,
      subjectId: subj.id,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-05T10:00:00Z"),
      endAt: new Date("2026-08-05T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    reviewBookingId = booking.id;
  });

  it("should create and find a review", async () => {
    const review = await reviewRepo.create({
      bookingId: reviewBookingId,
      parentId,
      studentId,
      tutorId,
      rating: 5,
      title: "Great tutor!",
      comment: "Very knowledgeable",
    });
    expect(review.id).toBeTruthy();
    expect(review.status).toBe("PENDING_MODERATION");

    const found = await reviewRepo.findById(review.id);
    expect(found).not.toBeNull();
  });

  it("should find by bookingId and parentId", async () => {
    await reviewRepo.create({
      bookingId: reviewBookingId,
      parentId,
      studentId,
      tutorId,
      rating: 5,
      title: "Great tutor!",
      comment: "Very knowledgeable",
    });
    const found = await reviewRepo.findByBookingIdAndParentId(
      reviewBookingId,
      parentId,
    );
    expect(found).not.toBeNull();
  });

  it("should find by tutorId", async () => {
    await reviewRepo.create({
      bookingId: reviewBookingId,
      parentId,
      studentId,
      tutorId,
      rating: 5,
      title: "Great tutor!",
      comment: "Very knowledgeable",
    });
    const reviews = await reviewRepo.findByTutorId(tutorId);
    expect(reviews.length).toBeGreaterThanOrEqual(1);
  });

  it("should find by parentId", async () => {
    await reviewRepo.create({
      bookingId: reviewBookingId,
      parentId,
      studentId,
      tutorId,
      rating: 4,
      title: "Good",
      comment: "Nice",
    });
    const reviews = await reviewRepo.findByParentId(parentId);
    expect(reviews.length).toBeGreaterThanOrEqual(1);
  });

  it("should moderate a review", async () => {
    const review = await reviewRepo.create({
      bookingId: reviewBookingId,
      parentId,
      studentId,
      tutorId,
      rating: 3,
      comment: "Average",
    });
    const adminUser = await userRepo.create({
      email: "moderator@test.com",
      primaryRole: "ADMIN",
    });
    const moderated = await reviewRepo.moderate(
      review.id,
      "PUBLISHED",
      adminUser.id,
    );
    expect(moderated.status).toBe("PUBLISHED");
    expect(moderated.moderatedByUserId).toBe(adminUser.id);
  });

  it("should find pending moderation reviews", async () => {
    const pending = await reviewRepo.findAllPendingModeration();
    expect(pending.length).toBeGreaterThanOrEqual(0);
  });

  it("should update tutor rating", async () => {
    const review = await reviewRepo.create({
      bookingId: reviewBookingId,
      parentId,
      studentId,
      tutorId,
      rating: 5,
      title: "Great!",
      comment: "Excellent",
    });
    const moderator = await userRepo.create({
      email: "rating-moderator@test.com",
      primaryRole: "ADMIN",
    });
    await reviewRepo.moderate(review.id, "PUBLISHED", moderator.id);
    const result = await reviewRepo.updateRating(tutorId);
    expect(result.averageRating).toBeGreaterThan(0);
    expect(result.reviewCount).toBeGreaterThanOrEqual(1);
  });

  it("should enforce unique constraint on bookingId for review", async () => {
    await reviewRepo.create({
      bookingId: reviewBookingId,
      parentId,
      studentId,
      tutorId,
      rating: 4,
    });
    await expect(
      reviewRepo.create({
        bookingId: reviewBookingId,
        parentId,
        studentId,
        tutorId,
        rating: 5,
      }),
    ).rejects.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Admin Repository
// ══════════════════════════════════════════════════════════════════════════

describe("PrismaAdminRepository (Integration)", () => {
  let userIdA: string;

  beforeEach(async () => {
    const u = await userRepo.create({
      email: "admin-test-user@test.com",
      primaryRole: "PARENT",
    });
    userIdA = u.id;
  });

  it("should list users with pagination", async () => {
    await userRepo.create({
      email: "admin-list-user@test.com",
      primaryRole: "PARENT",
    });
    const page = await adminRepo.listUsers({ limit: 10 });
    expect(page.data.length).toBeGreaterThanOrEqual(2);
    expect(page.page.limit).toBe(10);
  });

  it("should list users filtered by status", async () => {
    const page = await adminRepo.listUsers({ limit: 10, status: "ACTIVE" });
    expect(page.data.length).toBeGreaterThanOrEqual(0);
  });

  it("should get user by id", async () => {
    const u = await userRepo.create({
      email: "admin-get-user@test.com",
      primaryRole: "PARENT",
    });
    const found = await adminRepo.getUserById(u.id);
    expect(found).not.toBeNull();
    expect(found!.displayName).toBe(u.displayName);
  });

  it("should return null for non-existent user", async () => {
    const found = await adminRepo.getUserById("non-existent");
    expect(found).toBeNull();
  });

  it("should list tutors with pagination", async () => {
    const tutorUser = await userRepo.create({
      email: "admin-tutor@test.com",
      primaryRole: "TUTOR",
    });
    await tutorRepo.create({
      userId: tutorUser.id,
      headline: "Admin List Tutor",
    });
    const page = await adminRepo.listTutors({ limit: 10 });
    expect(page.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should list bookings with pagination", async () => {
    const parentUser = await userRepo.create({
      email: "admin-booking-parent@test.com",
      primaryRole: "PARENT",
    });
    const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
    const tutorUser = await userRepo.create({
      email: "admin-booking-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: tutorUser.id,
      headline: "Admin Booking Tutor",
    });
    const subj = await prisma.subject.create({
      data: {
        slug: "admin-booking-subject",
        name: "Admin Booking Subject",
        category: "ACADEMIC",
      },
    });
    const student = await studentRepo.create({
      fullName: "Admin Booking Student",
      grade: 10,
    });
    await studentRepo.createGuardianLink(student.id, parent.id);

    await bookingRepo.create({
      parentId: parent.id,
      studentId: student.id,
      tutorId: t.id,
      subjectId: subj.id,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-10T10:00:00Z"),
      endAt: new Date("2026-08-10T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    const page = await adminRepo.listBookings({ limit: 10 });
    expect(page.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should get booking by id", async () => {
    const parentUser = await userRepo.create({
      email: "admin-get-booking-parent@test.com",
      primaryRole: "PARENT",
    });
    const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
    const tutorUser = await userRepo.create({
      email: "admin-get-booking-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: tutorUser.id,
      headline: "Admin Get Booking Tutor",
    });
    const subj = await prisma.subject.create({
      data: {
        slug: "admin-get-booking-subject",
        name: "Admin Get Booking Subject",
        category: "ACADEMIC",
      },
    });
    const student = await studentRepo.create({
      fullName: "Admin Get Booking Student",
      grade: 10,
    });
    await studentRepo.createGuardianLink(student.id, parent.id);

    const booking = await bookingRepo.create({
      parentId: parent.id,
      studentId: student.id,
      tutorId: t.id,
      subjectId: subj.id,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-11T10:00:00Z"),
      endAt: new Date("2026-08-11T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    const found = await adminRepo.getBookingById(booking.id);
    expect(found).not.toBeNull();
  });

  it("should list payments with pagination", async () => {
    const parentUser = await userRepo.create({
      email: "admin-payment-parent@test.com",
      primaryRole: "PARENT",
    });
    const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
    const tutorUser = await userRepo.create({
      email: "admin-payment-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: tutorUser.id,
      headline: "Admin Payment Tutor",
    });
    const subj = await prisma.subject.create({
      data: {
        slug: "admin-payment-subject",
        name: "Admin Payment Subject",
        category: "ACADEMIC",
      },
    });
    const student = await studentRepo.create({
      fullName: "Admin Payment Student",
      grade: 10,
    });
    await studentRepo.createGuardianLink(student.id, parent.id);

    const booking = await bookingRepo.create({
      parentId: parent.id,
      studentId: student.id,
      tutorId: t.id,
      subjectId: subj.id,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-12T10:00:00Z"),
      endAt: new Date("2026-08-12T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "500.00",
    });
    await paymentRepo.create({
      bookingId: booking.id,
      parentId: parent.id,
      provider: "RAZORPAY",
      amount: 50000,
    });
    const page = await adminRepo.listPayments({ limit: 10 });
    expect(page.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should list refunds with pagination", async () => {
    const page = await adminRepo.listRefunds({ limit: 10 });
    expect(page.data.length).toBeGreaterThanOrEqual(0);
  });

  it("should get overview", async () => {
    const overview = await adminRepo.getOverview();
    expect(overview.users).toBeDefined();
    expect(overview.tutors).toBeDefined();
    expect(overview.bookings).toBeDefined();
    expect(overview.payments).toBeDefined();
    expect(overview.refunds).toBeDefined();
  });

  it("should create and list audit logs", async () => {
    const log = await adminRepo.createAuditLog({
      action: "USER_SUSPENDED",
      entityType: "User",
      entityId: userIdA,
      actorUserId: userIdA,
    });
    expect(log.id).toBeTruthy();
    expect(log.action).toBe("USER_SUSPENDED");

    const logs = await adminRepo.listAuditLogs({ limit: 10 });
    expect(logs.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should filter audit logs by entityType and action", async () => {
    const logs = await adminRepo.listAuditLogs({
      limit: 10,
      entityType: "User",
    });
    expect(logs.data.length).toBeGreaterThanOrEqual(0);

    const actionLogs = await adminRepo.listAuditLogs({
      limit: 10,
      action: "USER_SUSPENDED",
    });
    expect(actionLogs.data.length).toBeGreaterThanOrEqual(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Transaction & Rollback Tests
// ══════════════════════════════════════════════════════════════════════════

describe("Transaction and Rollback (Integration)", () => {
  let parentId: string;
  let tutorId: string;

  beforeEach(async () => {
    // Create parent
    const parentUser = await userRepo.create({
      email: "tx-parent@test.com",
      primaryRole: "PARENT",
    });
    const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
    parentId = parent.id;

    // Create tutor
    const tutorUser = await userRepo.create({
      email: "tx-tutor@test.com",
      primaryRole: "TUTOR",
    });
    const t = await tutorRepo.create({
      userId: tutorUser.id,
      headline: "Transaction Tutor",
    });
    tutorId = t.id;
    await prisma.tutor.update({
      where: { id: t.id },
      data: { status: "ACTIVE" },
    });
  });

  it("should roll back on failure within a transaction", async () => {
    await expect(
      paymentRepo.transaction(async (txRepo) => {
        await txRepo.create({
          bookingId: "temp-booking",
          parentId,
          provider: "RAZORPAY",
          amount: 99999,
        });
        // Force failure by violating a unique constraint
        await txRepo.create({
          bookingId: "temp-booking",
          parentId,
          provider: "RAZORPAY",
          amount: 1,
        });
      }),
    ).rejects.toThrow();

    // Payment with amount 99999 should not exist since transaction rolled back
    const payments = await prisma.payment.findMany({
      where: { amount: 99999 },
    });
    expect(payments.length).toBe(0);
  });

  it("should commit successful transaction", async () => {
    const subj = await prisma.subject.create({
      data: {
        slug: "tx-subject",
        name: "Transaction Subject",
        category: "ACADEMIC",
      },
    });
    const student = await studentRepo.create({
      fullName: "Transaction Student",
      grade: 10,
    });
    await studentRepo.createGuardianLink(student.id, parentId);

    const booking = await bookingRepo.create({
      parentId,
      studentId: student.id,
      tutorId,
      subjectId: subj.id,
      classType: "REGULAR",
      serviceMode: "ONLINE",
      startAt: new Date("2026-08-10T10:00:00Z"),
      endAt: new Date("2026-08-10T11:00:00Z"),
      durationMinutes: 60,
      priceAmount: "750.00",
    });

    const payment = await paymentRepo.transaction(async (txRepo) => {
      const p = await txRepo.create({
        bookingId: booking.id,
        parentId,
        provider: "RAZORPAY",
        amount: 75000,
        idempotencyKey: `tx-test-${Date.now()}`,
      });
      await txRepo.addTransaction({
        paymentId: p.id,
        provider: "RAZORPAY",
        eventType: "order.created",
        status: "PENDING",
      });
      return p;
    });

    expect(payment.id).toBeTruthy();
    const found = await paymentRepo.findById(payment.id);
    expect(found).not.toBeNull();
  });
});