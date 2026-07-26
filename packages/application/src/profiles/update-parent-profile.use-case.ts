import type { UseCase } from "../index.js";
import type { ParentProfileDto, ParentRepository, UpdateParentProfileInput } from "../index.js";
import { UserNotFoundError } from "../auth/errors.js";

export class UpdateParentProfileUseCase
  implements UseCase<{ userId: string; data: UpdateParentProfileInput }, ParentProfileDto>
{
  constructor(private readonly parentRepo: ParentRepository) {}

  async execute(input: { userId: string; data: UpdateParentProfileInput }): Promise<ParentProfileDto> {
    const existing = await this.parentRepo.findByUserId(input.userId);
    if (!existing) {
      throw new UserNotFoundError();
    }

    const updated = await this.parentRepo.updateByUserId(input.userId, input.data);

    return {
      id: updated.id,
      userId: updated.userId,
      city: updated.city,
      preferredLanguage: updated.preferredLanguage,
      referralCode: updated.referralCode,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}