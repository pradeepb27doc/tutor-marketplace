import type { UseCase } from "../index.js";
import type { StudentRepository, ParentRepository } from "../index.js";
import { UserNotFoundError } from "../auth/errors.js";

export interface DeleteStudentInput {
  studentId: string;
  userId: string;
}

export class DeleteStudentUseCase
  implements UseCase<DeleteStudentInput, void>
{
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly parentRepo: ParentRepository,
  ) {}

  async execute(input: DeleteStudentInput): Promise<void> {
    const student = await this.studentRepo.findById(input.studentId);
    if (!student || student.deletedAt) {
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

    await this.studentRepo.softDelete(input.studentId);
  }
}
