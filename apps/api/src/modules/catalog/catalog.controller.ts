import { Controller, Get, Param, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from "@nestjs/swagger";
import { Public } from "../auth/public.decorator.js";
import {
  ListSubjectsUseCase,
  GetSubjectUseCase,
} from "@tutor-marketplace/application";
import { SubjectParamDto } from "./dto/subject-param.dto.js";

@ApiTags("Catalog")
@Controller()
export class CatalogController {
  constructor(
    private readonly listSubjectsUseCase: ListSubjectsUseCase,
    private readonly getSubjectUseCase: GetSubjectUseCase,
  ) {}

  @Public()
  @Get("subjects")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "listSubjects", summary: "List all active subjects with their children" })
  @ApiOkResponse({ description: "List of active subjects retrieved successfully" })
  async listSubjects() {
    return {
      data: await this.listSubjectsUseCase.execute(),
    };
  }

  @Public()
  @Get("subjects/:subjectSlug")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getSubject", summary: "Get a subject by its slug" })
  @ApiOkResponse({ description: "Subject retrieved successfully" })
  @ApiNotFoundResponse({ description: "Subject not found" })
  async getSubject(@Param() params: SubjectParamDto) {
    return {
      data: await this.getSubjectUseCase.execute({ slug: params.subjectSlug }),
    };
  }

  @Public()
  @Get("catalog/grades")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "listGrades", summary: "List available grade options" })
  @ApiOkResponse({ description: "Grade options retrieved successfully" })
  async listGrades() {
    return {
      data: [
        { value: 1, label: "Grade 1" },
        { value: 2, label: "Grade 2" },
        { value: 3, label: "Grade 3" },
        { value: 4, label: "Grade 4" },
        { value: 5, label: "Grade 5" },
        { value: 6, label: "Grade 6" },
        { value: 7, label: "Grade 7" },
        { value: 8, label: "Grade 8" },
        { value: 9, label: "Grade 9" },
        { value: 10, label: "Grade 10" },
        { value: 11, label: "Grade 11" },
        { value: 12, label: "Grade 12" },
      ],
    };
  }

  @Public()
  @Get("catalog/curricula")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "listCurricula", summary: "List available curriculum options" })
  @ApiOkResponse({ description: "Curriculum options retrieved successfully" })
  async listCurricula() {
    return {
      data: [
        { value: "CBSE", label: "CBSE" },
        { value: "ICSE", label: "ICSE" },
        { value: "IGCSE", label: "IGCSE" },
        { value: "IB", label: "IB" },
        { value: "STATE_BOARD", label: "State Board" },
        { value: "OTHER", label: "Other" },
      ],
    };
  }

  @Public()
  @Get("catalog/filters")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "listFilters", summary: "Get supported filter options for search UI" })
  @ApiOkResponse({ description: "Filter options retrieved successfully" })
  async listFilters() {
    return {
      data: {
        subjects: await this.listSubjectsUseCase.execute(),
        grades: [
          { value: 1, label: "Grade 1" },
          { value: 2, label: "Grade 2" },
          { value: 3, label: "Grade 3" },
          { value: 4, label: "Grade 4" },
          { value: 5, label: "Grade 5" },
          { value: 6, label: "Grade 6" },
          { value: 7, label: "Grade 7" },
          { value: 8, label: "Grade 8" },
          { value: 9, label: "Grade 9" },
          { value: 10, label: "Grade 10" },
          { value: 11, label: "Grade 11" },
          { value: 12, label: "Grade 12" },
        ],
        curricula: [
          { value: "CBSE", label: "CBSE" },
          { value: "ICSE", label: "ICSE" },
          { value: "IGCSE", label: "IGCSE" },
          { value: "IB", label: "IB" },
          { value: "STATE_BOARD", label: "State Board" },
          { value: "OTHER", label: "Other" },
        ],
        serviceModes: [
          { value: "ONLINE", label: "Online" },
          { value: "HOME_TUITION", label: "Home Tuition" },
          { value: "GROUP_CLASS", label: "Group Class" },
        ],
      },
    };
  }
}