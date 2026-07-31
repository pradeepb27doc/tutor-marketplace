import type {
  ParentRecord,
  ParentRepository,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaParentRepository implements ParentRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByUserId(userId: string): Promise<ParentRecord | null> {
    const parent: any = await this.db.parent.findUnique({
      where: { userId },
    });
    if (!parent) return null;

    return this.toRecord(parent);
  }

  async updateByUserId(
    userId: string,
    data: Partial<ParentRecord>,
  ): Promise<ParentRecord> {
    const parent: any = await this.db.parent.update({
      where: { userId },
      data: {
        city: data.city ?? undefined,
        preferredLanguage: data.preferredLanguage ?? undefined,
      },
    });

    return this.toRecord(parent);
  }

  private toRecord(parent: any): ParentRecord {
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