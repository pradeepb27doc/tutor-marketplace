import type {
  UserRecord,
  UserRepository,
  CreateUserRecord,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaUserRepository implements UserRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.db.user.findUnique({ where: { email } });
    if (!user) return null;

    return this.toRecord(user);
  }

  async findByPhone(phone: string): Promise<UserRecord | null> {
    const user = await this.db.user.findUnique({ where: { phone } });
    if (!user) return null;

    return this.toRecord(user);
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) return null;

    return this.toRecord(user);
  }

  async create(data: CreateUserRecord): Promise<UserRecord> {
    const user = await this.db.user.create({
      data: {
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        passwordHash: data.passwordHash ?? undefined,
        displayName: data.displayName ?? undefined,
        primaryRole: data.primaryRole as any,
        locale: data.locale ?? "en-IN",
        timezone: data.timezone ?? "Asia/Kolkata",
      },
    });

    return this.toRecord(user);
  }

  async update(id: string, data: Partial<UserRecord>): Promise<UserRecord> {
    const user = await this.db.user.update({
      where: { id },
      data: {
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        passwordHash: data.passwordHash ?? undefined,
        displayName: data.displayName ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
        status: data.status as any ?? undefined,
        locale: data.locale ?? undefined,
        timezone: data.timezone ?? undefined,
        lastLoginAt: data.lastLoginAt ?? undefined,
        emailVerifiedAt: data.emailVerifiedAt ?? undefined,
        phoneVerifiedAt: data.phoneVerifiedAt ?? undefined,
      },
    });

    return this.toRecord(user);
  }

  private toRecord(user: any): UserRecord {
    return {
      id: user.id,
      publicId: user.publicId,
      email: user.email,
      phone: user.phone,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      primaryRole: user.primaryRole,
      locale: user.locale,
      timezone: user.timezone,
      emailVerifiedAt: user.emailVerifiedAt,
      phoneVerifiedAt: user.phoneVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}