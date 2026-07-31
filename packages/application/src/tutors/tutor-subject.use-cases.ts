import type { UseCase, SubjectRepository } from "../index.js";
import type { TutorRepository, TutorSubjectRepository } from "./tutor.repository.js";
import type { TutorSubjectDto, AddTutorSubjectInput } from "./tutor.dtos.js";

export class AddTutorSubjectUseCase
  implements UseCase<{ userId: string; data: AddTutorSubjectInput }, TutorSubjectDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly subjectRepo: SubjectRepository,
    private readonly tutorSubjectRepo: TutorSubjectRepository,
  ) {}

  async execute(input: { userId: string; data: AddTutorSubjectInput }): Promise<TutorSubjectDto> {
    const { userId, data } = input;

    const tutor = await this.tutorRepo.findByUserId(userId);
    if (!tutor) {
      throw new Error("Tutor profile not found");
    }

    // Validate subject exists
    const subject = await this.subjectRepo.findBySlug(data.subjectId);
    if (!subject) {
      // Try finding by ID as fallback
      const subjectById = await (this.subjectRepo as any).findById(data.subjectId);
      if (!subjectById) {
        throw new Error("Subject not found");
      }
    }

    // Check for duplicate
    const existing = await this.tutorSubjectRepo.findByTutorIdAndSubjectId(tutor.id, data.subjectId);
    if (existing) {
      if (existing.isActive) {
        throw new Error("Subject already added");
      }
      // Reactivate soft-deleted entry
      await this.tutorSubjectRepo.softDelete(existing.id); // Remove to re-create
    }

    const created = await this.tutorSubjectRepo.create({
      tutorId: tutor.id,
      subjectId: data.subjectId,
      gradeMin: data.gradeMin ?? null,
      gradeMax: data.gradeMax ?? null,
      hourlyRate: data.hourlyRate ?? null,
    });

    return {
      id: created.id,
      subjectId: created.subjectId,
      subjectName: created.subject?.name ?? "",
      subjectSlug: created.subject?.slug ?? "",
      gradeMin: created.gradeMin,
      gradeMax: created.gradeMax,
      hourlyRate: created.hourlyRate,
      isActive: created.isActive,
      createdAt: created.createdAt,
    };
  }
}

export class RemoveTutorSubjectUseCase
  implements UseCase<{ userId: string; tutorSubjectId: string }, void>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly tutorSubjectRepo: TutorSubjectRepository,
  ) {}

  async execute(input: { userId: string; tutorSubjectId: string }): Promise<void> {
    const { userId, tutorSubjectId } = input;

    const tutor = await this.tutorRepo.findByUserId(userId);
    if (!tutor) {
      throw new Error("Tutor profile not found");
    }

    const subject = await this.tutorSubjectRepo.findById(tutorSubjectId);
    if (!subject || subject.tutorId !== tutor.id) {
      throw new Error("Subject not found");
    }

    await this.tutorSubjectRepo.softDelete(tutorSubjectId);
  }
}

export class ListTutorSubjectsUseCase
  implements UseCase<{ userId: string }, TutorSubjectDto[]>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly tutorSubjectRepo: TutorSubjectRepository,
  ) {}

  async execute(input: { userId: string }): Promise<TutorSubjectDto[]> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) {
      throw new Error("Tutor profile not found");
    }

    const subjects = await this.tutorSubjectRepo.findByTutorId(tutor.id);

    return subjects
      .filter((s) => s.isActive)
      .map((s) => ({
        id: s.id,
        subjectId: s.subjectId,
        subjectName: s.subject?.name ?? "",
        subjectSlug: s.subject?.slug ?? "",
        gradeMin: s.gradeMin,
        gradeMax: s.gradeMax,
        hourlyRate: s.hourlyRate,
        isActive: s.isActive,
        createdAt: s.createdAt,
      }));
  }
}