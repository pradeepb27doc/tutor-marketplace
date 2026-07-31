import type { UseCase } from "../index.js";
import type { StudentDto, StudentRepository, ParentRepository, CreateStudentInput } from "../index.js";
import { UserNotFoundError } from "../auth/errors.js";

export interface CreateStudentInputWithParent {
  userId: string;
  data: CreateStudentInput;
}

export class CreateStudentUseCase
  implements UseCase<CreateStudentInputWithParent, StudentDto>
{
  constructor(
    private readonly parentRepo: ParentRepository,
    private readonly studentRepo: StudentRepository,
  ) {}

  async execute(input: CreateStudentInputWithParent): Promise<StudentDto> {
    const parent = await this.parentRepo.findByUserId(input.userId);
    if (!parent) {
      throw new UserNotFoundError();
    }

    // Check for existing student with same name for this parent
    const existingStudents = await this.studentRepo.findByParentId(parent.id);
    const duplicate = existingStudents.find(
      (s) => s.fullName.toLowerCase() === input.data.fullName.toLowerCase() && !s.deletedAt,
    );
    if (duplicate) {
      throw new Error("A student with this name already exists");
    }

    const student = await this.studentRepo.create({
      fullName: input.data.fullName,
      dateOfBirth: input.data.dateOfBirth ? new Date(input.data.dateOfBirth) : null,
      gender: input.data.gender ?? null,
      grade: input.data.grade ?? null,
      curriculum: input.data.curriculum ?? null,
      schoolName: input.data.schoolName ?? null,
      learningGoals: input.data.learningGoals ?? null,
    });

    // Create the StudentGuardian link
    await this.studentRepo.createGuardianLink(student.id, parent.id, "parent");

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
