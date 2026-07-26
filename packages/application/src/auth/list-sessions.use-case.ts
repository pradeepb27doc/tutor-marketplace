import type { UseCase } from "../index.js";
import type { SessionDto, SessionRepository } from "../index.js";

export interface ListSessionsInput {
  userId: string;
}

export class ListSessionsUseCase
  implements UseCase<ListSessionsInput, SessionDto[]>
{
  constructor(
    private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(input: ListSessionsInput): Promise<SessionDto[]> {
    const sessions = await this.sessionRepo.listByUserId(input.userId);
    return sessions
      .filter((s) => !s.revokedAt)
      .map((s) => ({
        id: s.id,
        deviceId: s.deviceId,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      }));
  }
}
