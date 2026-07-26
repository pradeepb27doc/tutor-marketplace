import type { UseCase } from "../index.js";
import type {
  CurrentUserDto,
  UserRepository,
  UserRoleRepository,
} from "../index.js";
import { UserNotFoundError } from "./errors.js";

export interface GetCurrentUserInput {
  userId: string;
}

export class GetCurrentUserUseCase
  implements UseCase<GetCurrentUserInput, CurrentUserDto>
{
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userRoleRepo: UserRoleRepository,
  ) {}

  async execute(input: GetCurrentUserInput): Promise<CurrentUserDto> {
    const userRecord = await this.userRepo.findById(input.userId);
    if (!userRecord) {
      throw new UserNotFoundError();
    }

    const roles = await this.userRoleRepo.findByUserId(input.userId);

    return {
      id: userRecord.id,
      displayName: userRecord.displayName,
      primaryRole: userRecord.primaryRole,
      roles: roles.map((r) => r.role),
      status: userRecord.status,
      email: userRecord.email,
      phone: userRecord.phone,
      locale: userRecord.locale,
      timezone: userRecord.timezone,
      avatarUrl: userRecord.avatarUrl,
      createdAt: userRecord.createdAt,
    };
  }
}