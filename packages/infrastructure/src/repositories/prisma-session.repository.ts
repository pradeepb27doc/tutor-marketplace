import type {
  SessionRecord,
  SessionRepository,
  CreateSessionRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaSessionRepository implements SessionRepository {
  private get db() {
    return getPrismaClient();
  }

  async create(data: CreateSessionRecord): Promise<SessionRecord> {
    const session = await this.db.userSession.create({
      data: {
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        deviceId: data.deviceId ?? undefined,
        ipAddress: data.ipAddress ?? undefined,
        userAgent: data.userAgent ?? undefined,
        expiresAt: data.expiresAt,
      },
    });

    return this.toRecord(session);
  }

  async findById(id: string): Promise<SessionRecord | null> {
    const session = await this.db.userSession.findUnique({ where: { id } });
    if (!session) return null;
    return this.toRecord(session);
  }

  async findByRefreshTokenHash(hash: string): Promise<SessionRecord | null> {
    const session = await this.db.userSession.findUnique({
      where: { refreshTokenHash: hash },
    });
    if (!session) return null;
    return this.toRecord(session);
  }

  async listByUserId(userId: string): Promise<SessionRecord[]> {
    const sessions: any[] = await this.db.userSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return sessions.map((s: any) => this.toRecord(s));
  }

  async revoke(id: string): Promise<void> {
    await this.db.userSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.db.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private toRecord(session: any): SessionRecord {
    return {
      id: session.id,
      userId: session.userId,
      refreshTokenHash: session.refreshTokenHash,
      deviceId: session.deviceId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      createdAt: session.createdAt,
    };
  }
}