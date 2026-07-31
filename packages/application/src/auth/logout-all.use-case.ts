import type { UseCase } from "../index.js";
import type { SessionRepository } from "../index.js";

export interface LogoutAllInput {
  userId: string;
}

export class LogoutAllUseCase implements UseCase<LogoutAllInput, void> {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async execute(input: LogoutAllInput): Promise<void> {
    await this.sessionRepo.revokeAllByUserId(input.userId);
  }
}