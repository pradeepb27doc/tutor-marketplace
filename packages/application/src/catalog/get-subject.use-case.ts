import type { UseCase } from "../index.js";
import type { SubjectDto, SubjectRepository } from "../index.js";

export interface GetSubjectInput {
  slug: string;
}

export class GetSubjectUseCase
  implements UseCase<GetSubjectInput, SubjectDto>
{
  constructor(private readonly subjectRepo: SubjectRepository) {}

  async execute(input: GetSubjectInput): Promise<SubjectDto> {
    const subject = await this.subjectRepo.findBySlug(input.slug);
    if (!subject || !subject.isActive) {
      throw new Error("Subject not found");
    }

    return {
      id: subject.id,
      slug: subject.slug,
      name: subject.name,
      category: subject.category,
      parentSubjectId: subject.parentSubjectId,
      isActive: subject.isActive,
    };
  }
}