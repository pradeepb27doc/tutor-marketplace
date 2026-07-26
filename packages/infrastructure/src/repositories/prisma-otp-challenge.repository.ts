import type {
  OtpChallengeRecord,
  OtpChallengeRepository,
  CreateOtpChallengeRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaOtpChallengeRepository implements OtpChallengeRepository {
  private get db() {
    return getPrismaClient();
  }

  async create(data: CreateOtpChallengeRecord): Promise<OtpChallengeRecord> {
    const challenge = await this.db.otpChallenge.create({
      data: {
        userId: data.userId ?? undefined,
        purpose: data.purpose as any,
        phone: data.phone ?? undefined,
        email: data.email ?? undefined,
        codeHash: data.codeHash,
        expiresAt: data.expiresAt,
      },
    });

    return this.toRecord(challenge);
  }

  async findById(id: string): Promise<OtpChallengeRecord | null> {
    const challenge = await this.db.otpChallenge.findUnique({ where: { id } });
    if (!challenge) return null;
    return this.toRecord(challenge);
  }

  async markConsumed(id: string): Promise<void> {
    await this.db.otpChallenge.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.db.otpChallenge.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  private toRecord(challenge: any): OtpChallengeRecord {
    return {
      id: challenge.id,
      userId: challenge.userId,
      purpose: challenge.purpose,
      phone: challenge.phone,
      email: challenge.email,
      codeHash: challenge.codeHash,
      attempts: challenge.attempts,
      expiresAt: challenge.expiresAt,
      consumedAt: challenge.consumedAt,
      createdAt: challenge.createdAt,
    };
  }
}