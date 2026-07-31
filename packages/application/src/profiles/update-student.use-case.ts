import type { UseCase } from "../index.js";
import type { StudentDto, StudentRepository, ParentRepository, UpdateStudentInput } from "../index.js";
import { UserNotFoundError } from "../auth/errors.js";

export interface UpdateStudentInputWithParent {
  studentId: string;
  userId: string;
  data: UpdateStudentInput;
}

export class UpdateStudentUseCase
  implements UseCase<UpdateStudentInputWithParent, StudentDto>
{
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly parentRepo: ParentRepository,
  ) {}

  async execute(input: UpdateStudentInputWithParent): Promise<StudentDto> {
    const existing = await this.studentRepo.findById(input.studentId);
    if (!existing || existing.deletedAt) {
      throw new UserNotFoundError();
    }

    // Verify parent ownership
    const parent = await this.parentRepo.findByUserId(input.userId);
    if (!parent) {
      throw new UserNotFoundError();
    }
    const isOwner = await this.studentRepo.verifyParentOwnership(input.studentId, parent.id);
    if (!isOwner) {
      throw new UserNotFoundError();
    }

    const updateData: Record<string, unknown> = {};
    if (input.data.fullName !== undefined) updateData.fullName = input.data.fullName;
    if (input.data.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(input.data.dateOfBirth);
    if (input.data.gender !== undefined) updateData.gender = input.data.gender;
    if (input.data.grade !== undefined) updateData.grade = input.data.grade;
    if (input.data.curriculum !== undefined) updateData.curriculum = input.data.curriculum;
    if (input.data.schoolName !== undefined) updateData.schoolName = input.data.schoolName;
    if (input.data.learningGoals !== undefined) updateData.learningGoals = input.data.learningGoals;
    if (input.data.notes !== undefined) updateData.notes = input.data.notes;

    const student = await this.studentRepo.update(input.studentId, updateData as any);

    return {
      id: student.id,
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth?.toISOString() ?? null,
      gender: student.gender,
      grade: student.grade,
      curriculum: student.curriculum,
      schoolName: student.schoolName,
      learningGoals: student.learningGoals,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}
