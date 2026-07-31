import type { UseCase } from "../index.js";
import type { SessionRepository } from "../index.js";

export interface LogoutInput {
  userId: string;
  sessionId: string;
}

export class LogoutUseCase implements UseCase<LogoutInput, void> {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    const { sessionId, userId } = input;

    const session = await this.sessionRepo.findById(sessionId);
    if (!session || session.userId !== userId) {
      return; // Silently succeed if session doesn't exist or doesn't belong to user
    }

    await this.sessionRepo.revoke(sessionId);
  }
}