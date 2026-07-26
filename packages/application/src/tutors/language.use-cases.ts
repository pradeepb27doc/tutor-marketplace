import type { UseCase } from "../index.js";
import type { TutorRepository, TutorLanguageRepository } from "./tutor.repository.js";
import type { TutorLanguageDto, AddLanguageInput } from "./tutor.dtos.js";

export class ListLanguagesUseCase
  implements UseCase<{ userId: string }, TutorLanguageDto[]>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly languageRepo: TutorLanguageRepository,
  ) {}

  async execute(input: { userId: string }): Promise<TutorLanguageDto[]> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    const records = await this.languageRepo.findByTutorId(tutor.id);
    return records.map((r) => ({
      id: r.id,
      language: r.language,
      proficiency: r.proficiency,
      createdAt: r.createdAt,
    }));
  }
}

export class AddLanguageUseCase
  implements UseCase<{ userId: string; data: AddLanguageInput }, TutorLanguageDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly languageRepo: TutorLanguageRepository,
  ) {}

  async execute(input: { userId: string; data: AddLanguageInput }): Promise<TutorLanguageDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    const record = await this.languageRepo.create({
      tutorId: tutor.id,
      language: input.data.language,
      proficiency: input.data.proficiency ?? null,
    });
    return {
      id: record.id,
      language: record.language,
      proficiency: record.proficiency,
      createdAt: record.createdAt,
    };
  }
}

export class RemoveLanguageUseCase
  implements UseCase<{ userId: string; languageId: string }, void>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly languageRepo: TutorLanguageRepository,
  ) {}

  async execute(input: { userId: string; languageId: string }): Promise<void> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    await this.languageRepo.delete(input.languageId);
  }
}