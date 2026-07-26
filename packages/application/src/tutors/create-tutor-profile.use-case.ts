import type { UseCase } from "../index.js";
import type { UserRoleRepository } from "../index.js";
import type { TutorProfileDto, CreateTutorProfileInput } from "./tutor.dtos.js";
import type { TutorRepository, CreateTutorRecord } from "./tutor.repository.js";

export class CreateTutorProfileUseCase
  implements UseCase<{ userId: string; data: CreateTutorProfileInput }, TutorProfileDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly userRoleRepo: UserRoleRepository,
  ) {}

  async execute(input: { userId: string; data: CreateTutorProfileInput }): Promise<TutorProfileDto> {
    const { userId, data } = input;

    // Check if user already has a tutor profile
    const existing = await this.tutorRepo.findByUserId(userId);
    if (existing) {
      throw new Error("Tutor profile already exists for this user");
    }

    // Create the tutor profile
    const createData: CreateTutorRecord = {
      userId,
      headline: data.headline ?? null,
      bio: data.bio ?? null,
      gender: data.gender ?? null,
      experienceYears: data.experienceYears ?? 0,
      city: data.city ?? null,
      locality: data.locality ?? null,
      baseHourlyRate: data.baseHourlyRate ?? null,
    };

    const tutor = await this.tutorRepo.create(createData);

    // Assign TUTOR role after successful profile creation
    await this.userRoleRepo.assignRole(userId, "TUTOR");

    return this.toDto(tutor);
  }

  private toDto(tutor: any): TutorProfileDto {
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