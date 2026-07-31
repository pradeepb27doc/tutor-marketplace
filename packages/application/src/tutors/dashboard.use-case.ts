import type { UseCase } from "../index.js";
import type { TutorRepository, TutorSubjectRepository } from "./tutor.repository.js";
import type { DashboardSummaryDto } from "./tutor.dtos.js";

export class DashboardUseCase
  implements UseCase<{ userId: string }, DashboardSummaryDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly tutorSubjectRepo: TutorSubjectRepository,
  ) {}

  async execute(input: { userId: string }): Promise<DashboardSummaryDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) {
      throw new Error("Tutor profile not found");
    }

    const subjects = await this.tutorSubjectRepo.findByTutorId(tutor.id);
    const activeSubjectCount = subjects.filter((s) => s.isActive).length;

    return {
      profileCompletionPercent: tutor.profileCompletionScore,
      completedClassesCount: tutor.completedClassesCount,
      averageRating: tutor.averageRating,
      reviewCount: tutor.reviewCount,
      activeSubjectCount,
      status: tutor.status,
    };
  }
}