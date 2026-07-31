import type { UseCase } from "../index.js";
import type {
  TutorSearchRepository,
  TutorSearchQuery,
  TutorSortKey,
} from "./search.repository.js";
import type {
  SearchTutorsQueryDto,
  TutorSearchResultDto,
  TutorCardDto,
} from "./search.dtos.js";

const DEFAULT_SORT: TutorSortKey = "RATING";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export class SearchTutorsUseCase
  implements UseCase<SearchTutorsQueryDto, TutorSearchResultDto>
{
  constructor(private readonly searchRepo: TutorSearchRepository) {}

  async execute(input: SearchTutorsQueryDto): Promise<TutorSearchResultDto> {
    const limit = this.normalizeLimit(input.limit);
    const sort = (input.sort ?? DEFAULT_SORT) as TutorSortKey;

    const query: TutorSearchQuery = {
      filters: {
        subjectId: input.subjectId,
        grade: input.grade,
        curricula: input.curricula,
        city: input.city,
        locality: input.locality,
        mode: input.mode,
        gender: input.gender,
        minRating: input.minRating,
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        experienceMin: input.experienceMin,
        experienceMax: input.experienceMax,
        verifiedOnly: input.verifiedOnly,
      },
      sort,
      cursor: input.cursor ?? null,
      limit,
    };

    const result = await this.searchRepo.search(query);

    const data: TutorCardDto[] = result.items.map((item) => ({
      id: item.id,
      displayName: item.displayName,
      headline: item.headline,
      city: item.city,
      locality: item.locality,
      gender: item.gender,
      experienceYears: item.experienceYears,
      averageRating: item.averageRating,
      reviewCount: item.reviewCount,
      completedClassesCount: item.completedClassesCount,
      baseHourlyRate: item.baseHourlyRate,
      currency: item.currency,
      isVerified: item.isVerified,
      primaryMode: item.primaryMode,
      lowestHourlyRate: item.lowestHourlyRate,
      subjectCount: item.subjectCount,
      subjects: item.subjects,
    }));

    return {
      data,
      nextCursor: result.nextCursor,
    };
  }

  private normalizeLimit(limit?: number): number {
    if (typeof limit !== "number" || Number.isNaN(limit)) return DEFAULT_LIMIT;
    if (limit < 1) return 1;
    if (limit > MAX_LIMIT) return MAX_LIMIT;
    return Math.floor(limit);
  }
}