import type { UseCase } from "../index.js";
import type { TutorRepository, TutorSubjectRepository } from "./tutor.repository.js";
import type { TutorProfileDto, PublicTutorProfileDto } from "./tutor.dtos.js";

export class GetMyTutorProfileUseCase
  implements UseCase<{ userId: string }, TutorProfileDto>
{
  constructor(private readonly tutorRepo: TutorRepository) {}

  async execute(input: { userId: string }): Promise<TutorProfileDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) {
      throw new Error("Tutor profile not found");
    }

    return {
      id: tutor.id,
      userId: tutor.userId,
      status: tutor.status,
      headline: tutor.headline,
      bio: tutor.bio,
      gender: tutor.gender,
      experienceYears: tutor.experienceYears,
      city: tutor.city,
      locality: tutor.locality,
      baseHourlyRate: tutor.baseHourlyRate,
      currency: tutor.currency,
      profileCompletionScore: tutor.profileCompletionScore,
      averageRating: tutor.averageRating,
      reviewCount: tutor.reviewCount,
      completedClassesCount: tutor.completedClassesCount,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt,
    };
  }
}

export class GetPublicTutorProfileUseCase
  implements UseCase<{ tutorId: string }, PublicTutorProfileDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly tutorSubjectRepo: TutorSubjectRepository,
  ) {}

  async execute(input: { tutorId: string }): Promise<PublicTutorProfileDto> {
    const tutor = await this.tutorRepo.findById(input.tutorId);
    if (!tutor) {
      throw new Error("Tutor not found");
    }

    const subjects = await this.tutorSubjectRepo.findByTutorId(input.tutorId);
    const activeSubjects = subjects
      .filter((s) => s.isActive && s.subject)
      .map((s) => ({
        id: s.subject!.id,
        name: s.subject!.name,
        slug: s.subject!.slug,
      }));

    return {
      id: tutor.id,
      displayName: null, // Filled by controller from user data
      headline: tutor.headline,
      bio: tutor.bio,
      city: tutor.city,
      averageRating: tutor.averageRating,
      reviewCount: tutor.reviewCount,
      completedClassesCount: tutor.completedClassesCount,
      subjects: activeSubjects,
    };
  }
}