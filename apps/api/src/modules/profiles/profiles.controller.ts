import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse } from "@nestjs/swagger";
import type { Request } from "express";
import {
  GetParentProfileUseCase,
  UpdateParentProfileUseCase,
  ListStudentsUseCase,
  CreateStudentUseCase,
  GetStudentUseCase,
  UpdateStudentUseCase,
  DeleteStudentUseCase,
} from "@tutor-marketplace/application";
import { listResponse } from "../../common/api-response.js";
import { UpdateParentDto } from "./dto/update-parent.dto.js";
import { CreateStudentDto } from "./dto/create-student.dto.js";
import { UpdateStudentDto } from "./dto/update-student.dto.js";

@ApiTags("Profiles")
@ApiBearerAuth()
@Controller()
export class ProfilesController {
  constructor(
    private readonly getParentProfileUseCase: GetParentProfileUseCase,
    private readonly updateParentProfileUseCase: UpdateParentProfileUseCase,
    private readonly listStudentsUseCase: ListStudentsUseCase,
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly getStudentUseCase: GetStudentUseCase,
    private readonly updateStudentUseCase: UpdateStudentUseCase,
    private readonly deleteStudentUseCase: DeleteStudentUseCase,
  ) {}

  // --- Parent Profile ---

  @Get("parents/me")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getParentProfile", summary: "Get current parent profile" })
  @ApiOkResponse({ description: "Parent profile retrieved successfully" })
  async getParentProfile(@Req() req: Request) {
    const user = (req as any).user;
    return {
      data: await this.getParentProfileUseCase.execute({ userId: user.id }),
    };
  }

  @Patch("parents/me")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "updateParentProfile", summary: "Update current parent profile" })
  @ApiOkResponse({ description: "Parent profile updated successfully" })
  async updateParentProfile(@Req() req: Request, @Body() dto: UpdateParentDto) {
    const user = (req as any).user;
    return {
      data: await this.updateParentProfileUseCase.execute({
        userId: user.id,
        data: dto,
      }),
    };
  }

  // --- Student Management ---

  @Get("parents/me/students")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "listStudents", summary: "List children of the current parent" })
  @ApiQuery({ name: "limit", required: false, description: "Number of results per page", example: 20 })
  @ApiQuery({ name: "cursor", required: false, description: "Pagination cursor" })
  @ApiQuery({ name: "sort", required: false, description: "Sort field and direction", example: "createdAt.desc" })
  @ApiOkResponse({ description: "List of children retrieved successfully" })
  async listStudents(
    @Req() req: Request,
    @Query("limit") limit?: string,
    @Query("cursor") cursor?: string,
  ) {
    const user = (req as any).user;
    const students = await this.listStudentsUseCase.execute({ userId: user.id });
    return listResponse(students, { limit: limit ? Number(limit) : undefined, cursor });
  }

  @Post("parents/me/students")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ operationId: "createStudent", summary: "Add a child profile" })
  @ApiCreatedResponse({ description: "Child profile created successfully" })
  async createStudent(@Req() req: Request, @Body() dto: CreateStudentDto) {
    const user = (req as any).user;
    return {
      data: await this.createStudentUseCase.execute({
        userId: user.id,
        data: dto,
      }),
    };
  }

  @Get("students/:studentId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getStudent", summary: "Get a child profile by ID" })
  @ApiParam({ name: "studentId", description: "Student ID", type: String, example: "student_01JABC" })
  @ApiOkResponse({ description: "Child profile retrieved successfully" })
  async getStudent(@Req() req: Request, @Param("studentId") studentId: string) {
    const user = (req as any).user;
    return {
      data: await this.getStudentUseCase.execute({ studentId, userId: user.id }),
    };
  }

  @Patch("students/:studentId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "updateStudent", summary: "Update a child profile" })
  @ApiParam({ name: "studentId", description: "Student ID", type: String, example: "student_01JABC" })
  @ApiOkResponse({ description: "Child profile updated successfully" })
  async updateStudent(
    @Req() req: Request,
    @Param("studentId") studentId: string,
    @Body() dto: UpdateStudentDto,
  ) {
    const user = (req as any).user;
    return {
      data: await this.updateStudentUseCase.execute({
        studentId,
        userId: user.id,
        data: dto,
      }),
    };
  }

  @Delete("students/:studentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: "deleteStudent", summary: "Soft-delete a child profile" })
  @ApiParam({ name: "studentId", description: "Student ID", type: String, example: "student_01JABC" })
  @ApiNoContentResponse({ description: "Child profile soft-deleted successfully" })
  async deleteStudent(@Req() req: Request, @Param("studentId") studentId: string) {
    const user = (req as any).user;
    await this.deleteStudentUseCase.execute({
      studentId,
      userId: user.id,
    });
  }
}