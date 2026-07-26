import type { UseCase } from "../index.js";
import type { TutorRepository, TutorQualificationRepository } from "./tutor.repository.js";
import type { TutorQualificationDto, AddQualificationInput, UpdateQualificationInput } from "./tutor.dtos.js";

export class ListQualificationsUseCase
  implements UseCase<{ userId: string }, TutorQualificationDto[]>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly qualificationRepo: TutorQualificationRepository,
  ) {}

  async execute(input: { userId: string }): Promise<TutorQualificationDto[]> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    const records = await this.qualificationRepo.findByTutorId(tutor.id);
    return records.map((r) => ({
      id: r.id,
      title: r.title,
      institutionName: r.institutionName,
      completionYear: r.completionYear,
      createdAt: r.createdAt,
    }));
  }
}

export class AddQualificationUseCase
  implements UseCase<{ userId: string; data: AddQualificationInput }, TutorQualificationDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly qualificationRepo: TutorQualificationRepository,
  ) {}

  async execute(input: { userId: string; data: AddQualificationInput }): Promise<TutorQualificationDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    const record = await this.qualificationRepo.create({
      tutorId: tutor.id,
      title: input.data.title,
      institutionName: input.data.institutionName ?? null,
      completionYear: input.data.completionYear ?? null,
    });
    return {
      id: record.id,
      title: record.title,
      institutionName: record.institutionName,
      completionYear: record.completionYear,
      createdAt: record.createdAt,
    };
  }
}

export class UpdateQualificationUseCase
  implements UseCase<{ userId: string; qualificationId: string; data: UpdateQualificationInput }, TutorQualificationDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly qualificationRepo: TutorQualificationRepository,
  ) {}

  async execute(input: { userId: string; qualificationId: string; data: UpdateQualificationInput }): Promise<TutorQualificationDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    const existing = await this.qualificationRepo.findById(input.qualificationId);
    if (!existing || existing.tutorId !== tutor.id) throw new Error("Qualification not found");
    const updateData: Record<string, unknown> = {};
    if (input.data.title !== undefined) updateData.title = input.data.title;
    if (input.data.institutionName !== undefined) updateData.institutionName = input.data.institutionName;
    if (input.data.completionYear !== undefined) updateData.completionYear = input.data.completionYear;
    const record = await this.qualificationRepo.update(input.qualificationId, updateData as any);
    return {
      id: record.id,
      title: record.title,
      institutionName: record.institutionName,
      completionYear: record.completionYear,
      createdAt: record.createdAt,
    };
  }
}

export class RemoveQualificationUseCase
  implements UseCase<{ userId: string; qualificationId: string }, void>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly qualificationRepo: TutorQualificationRepository,
  ) {}

  async execute(input: { userId: string; qualificationId: string }): Promise<void> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    const existing = await this.qualificationRepo.findById(input.qualificationId);
    if (!existing || existing.tutorId !== tutor.id) throw new Error("Qualification not found");
    await this.qualificationRepo.delete(input.qualificationId);
  }
}