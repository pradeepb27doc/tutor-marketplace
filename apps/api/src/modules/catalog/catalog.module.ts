import { Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller.js";
import {
  ListSubjectsUseCase,
  GetSubjectUseCase,
} from "@tutor-marketplace/application";
import { PrismaSubjectRepository } from "@tutor-marketplace/infrastructure";

@Module({
  controllers: [CatalogController],
  providers: [
    // Use Cases
    {
      provide: ListSubjectsUseCase,
      useFactory: (subjectRepo: any) => new ListSubjectsUseCase(subjectRepo),
      inject: ["SubjectRepository"],
    },
    {
      provide: GetSubjectUseCase,
      useFactory: (subjectRepo: any) => new GetSubjectUseCase(subjectRepo),
      inject: ["SubjectRepository"],
    },

    // Repository
    {
      provide: "SubjectRepository",
      useClass: PrismaSubjectRepository,
    },
  ],
})
export class CatalogModule {}