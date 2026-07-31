import type { UseCase } from "../index.js";
import type { TutorRepository } from "./tutor.repository.js";
import type { TutorProfileDto, UpdateTutorProfileInput } from "./tutor.dtos.js";

export class UpdateTutorProfileUseCase
  implements UseCase<{ userId: string; data: UpdateTutorProfileInput }, TutorProfileDto>
{
  constructor(private readonly tutorRepo: TutorRepository) {}

  async execute(input: { userId: string; data: UpdateTutorProfileInput }): Promise<TutorProfileDto> {
    const { userId, data } = input;

    const tutor = await this.tutorRepo.findByUserId(userId);
    if (!tutor) {
      throw new Error("Tutor profile not found");
    }

    const updateData: Record<string, unknown> = {};
    if (data.headline !== undefined) updateData.headline = data.headline;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.experienceYears !== undefined) updateData.experienceYears = data.experienceYears;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.locality !== undefined) updateData.locality = data.locality;
    if (data.baseHourlyRate !== undefined) updateData.baseHourlyRate = data.baseHourlyRate;

    // Recalculate profile completion score
    const score = this.calculateCompletionScore({ ...tutor, ...updateData });
    updateData.profileCompletionScore = score;

    const updated = await this.tutorRepo.update(tutor.id, updateData as any);

    return {
      id: updated.id,
      userId: updated.userId,
      status: updated.status,
      headline: updated.headline,
      bio: updated.bio,
      gender: updated.gender,
      experienceYears: updated.experienceYears,
      city: updated.city,
      locality: updated.locality,
      baseHourlyRate: updated.baseHourlyRate,
      currency: updated.currency,
      profileCompletionScore: updated.profileCompletionScore,
      averageRating: updated.averageRating,
      reviewCount: updated.reviewCount,
      completedClassesCount: updated.completedClassesCount,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  private calculateCompletionScore(tutor: any): number {
    const fields = ["headline", "bio", "gender", "city", "baseHourlyRate"];
    const filled = fields.filter((f) => tutor[f] !== null && tutor[f] !== undefined && tutor[f] !== "");
    const hasExperience = tutor.experienceYears > 0;
    const totalFields = fields.length + 1; // +1 for experienceYears
    const filledCount = filled.length + (hasExperience ? 1 : 0);
    return Math.round((filledCount / totalFields) * 100);
  }
}