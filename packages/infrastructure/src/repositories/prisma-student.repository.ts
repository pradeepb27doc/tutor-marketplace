import type {
  StudentRecord,
  StudentRepository,
  CreateStudentRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaStudentRepository implements StudentRepository {
  private get db() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<StudentRecord | null> {
    const student: any = await this.db.student.findUnique({ where: { id } });
    if (!student) return null;
    return this.toRecord(student);
  }

  async findByParentId(parentId: string): Promise<StudentRecord[]> {
    // Find through StudentGuardian join
    const guardians: any[] = await this.db.studentGuardian.findMany({
      where: { parentId },
      include: { student: true },
    });

    return guardians
      .map((g: any) => g.student)
      .filter((s: any) => !s.deletedAt)
      .map((s: any) => this.toRecord(s));
  }

  async create(data: CreateStudentRecord): Promise<StudentRecord> {
    const student: any = await this.db.student.create({
      data: {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth ?? undefined,
        gender: (data.gender ?? undefined) as any,
        grade: data.grade ?? undefined,
        curriculum: (data.curriculum ?? undefined) as any,
        schoolName: data.schoolName ?? undefined,
        learningGoals: data.learningGoals ?? undefined,
      },
    });

    return this.toRecord(student);
  }

  async update(id: string, data: Partial<StudentRecord>): Promise<StudentRecord> {
    const student: any = await this.db.student.update({
      where: { id },
      data: {
        fullName: data.fullName ?? undefined,
        dateOfBirth: data.dateOfBirth ?? undefined,
        gender: (data.gender ?? undefined) as any,
        grade: data.grade ?? undefined,
        curriculum: (data.curriculum ?? undefined) as any,
        schoolName: data.schoolName ?? undefined,
        learningGoals: data.learningGoals ?? undefined,
        notes: data.notes ?? undefined,
      },
    });

    return this.toRecord(student);
  }

  async softDelete(id: string): Promise<void> {
    await this.db.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async verifyParentOwnership(studentId: string, parentId: string): Promise<boolean> {
    const guardian: any = await this.db.studentGuardian.findUnique({
      where: {
        studentId_parentId: { studentId, parentId },
      },
    });
    return guardian !== null;
  }

  async createGuardianLink(studentId: string, parentId: string, relationToChild?: string): Promise<void> {
    await this.db.studentGuardian.create({
      data: {
        studentId,
        parentId,
        relationToChild: relationToChild ?? "parent",
        isPrimary: true,
        canBook: true,
        canViewProgress: true,
      },
    });
  }

  private toRecord(student: any): StudentRecord {
    return {
      id: student.id,
      userId: student.userId,
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      grade: student.grade,
      curriculum: student.curriculum,
      schoolName: student.schoolName,
      learningGoals: student.learningGoals,
      notes: student.notes,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      deletedAt: student.deletedAt,
    };
  }
}
