import type {
  UserRoleRecord,
  UserRoleRepository,
} from "@tutor-marketplace/application";
import { getPrismaClient } from "@tutor-marketplace/database";

export class PrismaUserRoleRepository implements UserRoleRepository {
  private get db() {
    return getPrismaClient();
  }

  async findByUserId(userId: string): Promise<UserRoleRecord[]> {
    const roles: any[] = await this.db.userRoleAssignment.findMany({
      where: { userId },
    });

    return roles.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      role: r.role,
    }));
  }

  async assignRole(userId: string, role: string): Promise<UserRoleRecord> {
    const assignment: any = await this.db.userRoleAssignment.create({
      data: {
        userId,
        role: role as any,
      },
    });

    return {
      id: assignment.id,
      userId: assignment.userId,
      role: assignment.role,
    };
  }
}
