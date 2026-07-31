import type { UseCase } from "../index.js";
import type { ParentProfileDto, ParentRepository } from "../index.js";
import { UserNotFoundError } from "../auth/errors.js";

export interface GetParentProfileInput {
  userId: string;
}

export class GetParentProfileUseCase
  implements UseCase<GetParentProfileInput, ParentProfileDto>
{
  constructor(private readonly parentRepo: ParentRepository) {}

  async execute(input: GetParentProfileInput): Promise<ParentProfileDto> {
    const parent = await this.parentRepo.findByUserId(input.userId);
    if (!parent) {
      throw new UserNotFoundError();
    }

    return {
      id: parent.id,
      userId: parent.userId,
      city: parent.city,
      preferredLanguage: parent.preferredLanguage,
      referralCode: parent.referralCode,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
    };
  }
}