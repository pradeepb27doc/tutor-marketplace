import { Module } from "@nestjs/common";
import { ProfilesController } from "./profiles.controller.js";
import {
  GetParentProfileUseCase,
  UpdateParentProfileUseCase,
  ListStudentsUseCase,
  CreateStudentUseCase,
  GetStudentUseCase,
  UpdateStudentUseCase,
  DeleteStudentUseCase,
} from "@tutor-marketplace/application";
import {
  PrismaParentRepository,
  PrismaStudentRepository,
} from "@tutor-marketplace/infrastructure";

@Module({
  controllers: [ProfilesController],
  providers: [
    // Use Cases
    {
      provide: GetParentProfileUseCase,
      useFactory: (parentRepo: any) => new GetParentProfileUseCase(parentRepo),
      inject: ["ParentRepository"],
    },
    {
      provide: UpdateParentProfileUseCase,
      useFactory: (parentRepo: any) => new UpdateParentProfileUseCase(parentRepo),
      inject: ["ParentRepository"],
    },
    {
      provide: ListStudentsUseCase,
      useFactory: (parentRepo: any, studentRepo: any) =>
        new ListStudentsUseCase(parentRepo, studentRepo),
      inject: ["ParentRepository", "StudentRepository"],
    },
    {
      provide: CreateStudentUseCase,
      useFactory: (parentRepo: any, studentRepo: any) =>
        new CreateStudentUseCase(parentRepo, studentRepo),
      inject: ["ParentRepository", "StudentRepository"],
    },
    {
      provide: GetStudentUseCase,
      useFactory: (studentRepo: any, parentRepo: any) =>
        new GetStudentUseCase(studentRepo, parentRepo),
      inject: ["StudentRepository", "ParentRepository"],
    },
    {
      provide: UpdateStudentUseCase,
      useFactory: (studentRepo: any, parentRepo: any) =>
        new UpdateStudentUseCase(studentRepo, parentRepo),
      inject: ["StudentRepository", "ParentRepository"],
    },
    {
      provide: DeleteStudentUseCase,
      useFactory: (studentRepo: any, parentRepo: any) =>
        new DeleteStudentUseCase(studentRepo, parentRepo),
      inject: ["StudentRepository", "ParentRepository"],
    },

    // Repositories
    {
      provide: "ParentRepository",
      useClass: PrismaParentRepository,
    },
    {
      provide: "StudentRepository",
      useClass: PrismaStudentRepository,
    },
  ],
})
export class ProfilesModule {}