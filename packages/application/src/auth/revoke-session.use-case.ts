import type { UseCase } from "../index.js";
import type { SessionRepository } from "../index.js";

export interface RevokeSessionInput {
  userId: string;
  sessionId: string;
}

export class RevokeSessionUseCase
  implements UseCase<RevokeSessionInput, void>
{
  constructor(private readonly sessionRepo: SessionRepository) {}

  async execute(input: RevokeSessionInput): Promise<void> {
    const { sessionId, userId } = input;

    const session = await this.sessionRepo.findById(sessionId);
    if (!session || session.userId !== userId) {
      return; // Silently succeed if session doesn't exist or doesn't belong to user
    }

    await this.sessionRepo.revoke(sessionId);
  }
}