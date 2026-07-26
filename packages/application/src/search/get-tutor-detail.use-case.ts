import type { UseCase } from "../index.js";
import type { UserRepository, UserRecord } from "../index.js";
import type {
  TutorRepository,
  TutorSubjectRepository,
  TutorQualificationRepository,
  TutorLanguageRepository,
  TutorServiceAreaRepository,
} from "./../tutors/tutor.repository.js";
import type { TutorVerificationRepository } from "./../tutors/verification.repository.js";
import { REQUIRED_VERIFICATION_TYPES } from "./../tutors/verification.repository.js";
import type {
  PublicTutorDetailDto,
  PublicTutorSubjectDto,
  PublicTutorQualificationDto,
  PublicTutorLanguageDto,
  PublicTutorServiceAreaDto,
} from "./search.dtos.js";

const ACTIVE_STATUS = "ACTIVE";

export class GetPublicTutorDetailUseCase
  implements UseCase<{ tutorId: string }, PublicTutorDetailDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly tutorSubjectRepo: TutorSubjectRepository,
    private readonly qualificationRepo: TutorQualificationRepository,
    private readonly languageRepo: TutorLanguageRepository,
    private readonly serviceAreaRepo: TutorServiceAreaRepository,
    private readonly verificationRepo: TutorVerificationRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(input: { tutorId: string }): Promise<PublicTutorDetailDto> {
    const tutor = await this.tutorRepo.findById(input.tutorId);
    if (!tutor || tutor.status !== ACTIVE_STATUS || tutor.deletedAt != null) {
      throw new Error("Tutor not found");
    }

    const [subjects, qualifications, languages, serviceAreas, checks, user] =
      await Promise.all([
        this.tutorSubjectRepo.findByTutorId(input.tutorId),
        this.qualificationRepo.findByTutorId(input.tutorId),
        this.languageRepo.findByTutorId(input.tutorId),
        this.serviceAreaRepo.findByTutorId(input.tutorId),
        this.verificationRepo.findChecksByTutorId(input.tutorId),
        this.userRepo.findById(tutor.userId) as Promise<UserRecord | null>,
      ]);

    const isVerified = REQUIRED_VERIFICATION_TYPES.every((type) =>
      checks.some((c) => c.type === type && c.status === "APPROVED"),
    );

    const subjectDtos: PublicTutorSubjectDto[] = subjects
      .filter((s) => s.subject)
      .map((s) => ({
        id: s.id,
        subjectId: s.subjectId,
        subjectName: s.subject!.name,
        subjectSlug: s.subject!.slug,
        gradeMin: s.gradeMin,
        gradeMax: s.gradeMax,
        hourlyRate: s.hourlyRate,
        serviceModes: s.serviceModes ?? [],
        curricula: s.curricula ?? [],
        isActive: s.isActive,
      }));

    const qualificationDtos: PublicTutorQualificationDto[] = qualifications.map(
      (q) => ({
        id: q.id,
        title: q.title,
        institutionName: q.institutionName,
        completionYear: q.completionYear,
      }),
    );

    const languageDtos: PublicTutorLanguageDto[] = languages.map((l) => ({
      id: l.id,
      language: l.language,
      proficiency: l.proficiency,
    }));

    const serviceAreaDtos: PublicTutorServiceAreaDto[] = serviceAreas.map(
      (a) => ({
        id: a.id,
        city: a.city,
        locality: a.locality,
        radiusKm: a.radiusKm,
      }),
    );

    return {
      id: tutor.id,
      userId: tutor.userId,
      displayName: user?.displayName ?? null,
      headline: tutor.headline,
      bio: tutor.bio,
      city: tutor.city,
      locality: tutor.locality,
      gender: tutor.gender,
      experienceYears: tutor.experienceYears,
      averageRating: tutor.averageRating,
      reviewCount: tutor.reviewCount,
      completedClassesCount: tutor.completedClassesCount,
      baseHourlyRate: tutor.baseHourlyRate,
      currency: tutor.currency,
      isVerified,
      subjects: subjectDtos,
      qualifications: qualificationDtos,
      languages: languageDtos,
      serviceAreas: serviceAreaDtos,
      verification: {
        isVerified,
        checkedTypes: checks.map((c) => c.type),
      },
    };
  }
}