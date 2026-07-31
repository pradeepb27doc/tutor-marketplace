import type { UseCase } from "../index.js";
import type { SubjectDto, SubjectRepository } from "../index.js";

export class ListSubjectsUseCase
  implements UseCase<void, SubjectDto[]>
{
  constructor(private readonly subjectRepo: SubjectRepository) {}

  async execute(): Promise<SubjectDto[]> {
    const subjects = await this.subjectRepo.findAllActive();
    return subjects.map(this.toDto);
  }

  private toDto(subject: any): SubjectDto {
    return {
      id: subject.id,
      slug: subject.slug,
      name: subject.name,
      category: subject.category,
      parentSubjectId: subject.parentSubjectId,
      isActive: subject.isActive,
      children: subject.children
        ? subject.children.filter((c: any) => c.isActive).map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            category: c.category,
            parentSubjectId: c.parentSubjectId,
            isActive: c.isActive,
          }))
        : undefined,
    };
  }
}