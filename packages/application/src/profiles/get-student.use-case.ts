import type { UseCase } from "../index.js";
import type { StudentDto, StudentRepository, ParentRepository } from "../index.js";
import { UserNotFoundError } from "../auth/errors.js";

export interface GetStudentInput {
  studentId: string;
  userId?: string;
}

export class GetStudentUseCase
  implements UseCase<GetStudentInput, StudentDto>
{
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly parentRepo: ParentRepository,
  ) {}

  async execute(input: GetStudentInput): Promise<StudentDto> {
    const student = await this.studentRepo.findById(input.studentId);
    if (!student || student.deletedAt) {
      throw new UserNotFoundError();
    }

    // If userId is provided, verify parent ownership
    if (input.userId) {
      const parent = await this.parentRepo.findByUserId(input.userId);
      if (!parent) {
        throw new UserNotFoundError();
      }
      const isOwner = await this.studentRepo.verifyParentOwnership(input.studentId, parent.id);
      if (!isOwner) {
        throw new UserNotFoundError();
      }
    }

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
