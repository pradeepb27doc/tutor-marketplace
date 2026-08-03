import { Controller, Get, Param, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiOkResponse, ApiNotFoundResponse, ApiQuery } from "@nestjs/swagger";
import { Public } from "../auth/public.decorator.js";
import {
  SearchTutorsUseCase,
  GetPublicTutorDetailUseCase,
} from "@tutor-marketplace/application";
import { RedisCache, getRedisCache } from "@tutor-marketplace/infrastructure";
import { SearchTutorsQueryDto } from "./dto/search-query.dto.js";
import { listResponse } from "../../common/api-response.js";

const SEARCH_TTL_SECONDS = 300; // 5 min
const PROFILE_TTL_SECONDS = 600; // 10 min

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(
    private readonly searchTutorsUseCase: SearchTutorsUseCase,
    private readonly getTutorDetailUseCase: GetPublicTutorDetailUseCase,
    private readonly cache: RedisCache = getRedisCache(),
  ) {}

  @Public()
  @Get("tutors")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "searchTutors", summary: "Search public, active tutors with filters, sorting, and cursor pagination" })
  @ApiOkResponse({ description: "Paginated list of tutors matching search criteria" })
  @ApiQuery({ name: "subjectSlug", required: false, description: "Filter by subject slug", example: "mathematics" })
  @ApiQuery({ name: "grade", required: false, description: "Filter by grade (1-12)", example: 5 })
  @ApiQuery({ name: "curriculum", required: false, description: "Filter by curriculum", example: "CBSE" })
  @ApiQuery({ name: "city", required: false, description: "Filter by city", example: "Bengaluru" })
  @ApiQuery({ name: "serviceMode", required: false, description: "Filter by service mode", enum: ["ONLINE", "HOME_TUITION", "GROUP_CLASS"] })
  @ApiQuery({ name: "maxFee", required: false, description: "Maximum hourly fee (INR)", example: 800 })
  @ApiQuery({ name: "availableFrom", required: false, description: "Available from timestamp (ISO 8601)", example: "2026-07-03T09:00:00.000Z" })
  @ApiQuery({ name: "availableTo", required: false, description: "Available to timestamp (ISO 8601)", example: "2026-07-03T18:00:00.000Z" })
  @ApiQuery({ name: "limit", required: false, description: "Page size (1-50, default 20)", example: 20 })
  @ApiQuery({ name: "cursor", required: false, description: "Cursor for pagination" })
  async searchTutors(@Query() query: SearchTutorsQueryDto) {
    const normalizedQuery = {
      ...query,
      subjectId: query.subjectId ?? query.subjectSlug,
      curricula: query.curricula ?? (query.curriculum ? [query.curriculum] : undefined),
      mode: normalizeMode(query.mode ?? query.serviceMode),
      priceMax: query.priceMax ?? query.maxFee,
    };
    const cacheKey = RedisCache.keys.search(
      this.hashQuery(normalizedQuery),
      normalizedQuery.cursor ?? "first",
    );

    const result = await this.cache.getOrSet(
      cacheKey,
      async () => {
        const fresh = await this.searchTutorsUseCase.execute(normalizedQuery);
        return {
          data: fresh.data,
          nextCursor: fresh.nextCursor,
        };
      },
      SEARCH_TTL_SECONDS,
    );

    return listResponse(result.data, {
      limit: normalizedQuery.limit,
      cursor: normalizedQuery.cursor,
      nextCursor: result.nextCursor,
    });
  }

  @Public()
  @Get("tutors/:tutorId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getTutorDetail", summary: "Get public tutor detail by id" })
  @ApiOkResponse({ description: "Public tutor detail retrieved successfully" })
  @ApiNotFoundResponse({ description: "Tutor not found" })
  @ApiParam({ name: "tutorId", description: "Tutor id", example: "tutor_01JABC" })
  async getTutorDetail(@Param("tutorId") tutorId: string) {
    const cacheKey = RedisCache.keys.tutorProfile(tutorId);
    const detail = await this.cache.getOrSet(
      cacheKey,
      () => this.getTutorDetailUseCase.execute({ tutorId }),
      PROFILE_TTL_SECONDS,
    );
    return { data: detail };
  }

  private hashQuery(query: Record<string, unknown>): string {
    const stable = Object.keys(query)
      .sort()
      .map((k) => `${k}:${String(query[k] ?? "")}`)
      .join("|");
    let hash = 0;
    for (let i = 0; i < stable.length; i++) {
      const char = stable.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `hash-${Math.abs(hash)}`;
  }
}

function normalizeMode(mode?: SearchTutorsQueryDto["mode"] | SearchTutorsQueryDto["serviceMode"]) {
  if (mode === "HOME_TUITION") return "OFFLINE";
  if (mode === "GROUP_CLASS") return "HYBRID";
  return mode;
}