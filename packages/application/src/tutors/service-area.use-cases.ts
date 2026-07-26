import type { UseCase } from "../index.js";
import type { TutorRepository, TutorServiceAreaRepository } from "./tutor.repository.js";
import type { TutorServiceAreaDto, AddServiceAreaInput } from "./tutor.dtos.js";

export class ListServiceAreasUseCase
  implements UseCase<{ userId: string }, TutorServiceAreaDto[]>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly serviceAreaRepo: TutorServiceAreaRepository,
  ) {}

  async execute(input: { userId: string }): Promise<TutorServiceAreaDto[]> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    const records = await this.serviceAreaRepo.findByTutorId(tutor.id);
    return records.map((r) => ({
      id: r.id,
      city: r.city,
      locality: r.locality,
      radiusKm: r.radiusKm,
      createdAt: r.createdAt,
    }));
  }
}

export class AddServiceAreaUseCase
  implements UseCase<{ userId: string; data: AddServiceAreaInput }, TutorServiceAreaDto>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly serviceAreaRepo: TutorServiceAreaRepository,
  ) {}

  async execute(input: { userId: string; data: AddServiceAreaInput }): Promise<TutorServiceAreaDto> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    const record = await this.serviceAreaRepo.create({
      tutorId: tutor.id,
      city: input.data.city,
      locality: input.data.locality ?? null,
      radiusKm: input.data.radiusKm ?? null,
    });
    return {
      id: record.id,
      city: record.city,
      locality: record.locality,
      radiusKm: record.radiusKm,
      createdAt: record.createdAt,
    };
  }
}

export class RemoveServiceAreaUseCase
  implements UseCase<{ userId: string; serviceAreaId: string }, void>
{
  constructor(
    private readonly tutorRepo: TutorRepository,
    private readonly serviceAreaRepo: TutorServiceAreaRepository,
  ) {}

  async execute(input: { userId: string; serviceAreaId: string }): Promise<void> {
    const tutor = await this.tutorRepo.findByUserId(input.userId);
    if (!tutor) throw new Error("Tutor profile not found");
    await this.serviceAreaRepo.delete(input.serviceAreaId);
  }
}