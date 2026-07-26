import type { UseCase } from "../index.js";
import type { StudentDto, StudentRepository, ParentRepository } from "../index.js";
import { UserNotFoundError } from "../auth/errors.js";

export interface ListStudentsInput {
  userId: string;
}

export class ListStudentsUseCase
  implements UseCase<ListStudentsInput, StudentDto[]>
{
  constructor(
    private readonly parentRepo: ParentRepository,
    private readonly studentRepo: StudentRepository,
  ) {}

  async execute(input: ListStudentsInput): Promise<StudentDto[]> {
    const parent = await this.parentRepo.findByUserId(input.userId);
    if (!parent) {
      throw new UserNotFoundError();
    }

    const students = await this.studentRepo.findByParentId(parent.id);

    return students.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      dateOfBirth: s.dateOfBirth?.toISOString() ?? null,
      gender: s.gender,
      grade: s.grade,
      curriculum: s.curriculum,
      schoolName: s.schoolName,
      learningGoals: s.learningGoals,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }
}