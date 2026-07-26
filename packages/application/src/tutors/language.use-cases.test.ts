import { describe, it, expect } from "vitest";
import {
  ListLanguagesUseCase,
  AddLanguageUseCase,
  RemoveLanguageUseCase,
} from "./language.use-cases.js";
import {
  FakeTutorRepository,
  FakeTutorLanguageRepository,
  buildTutorRecord,
} from "@tutor-marketplace/testing";

function setup() {
  const tutorRepo = new FakeTutorRepository();
  tutorRepo.tutors.push(buildTutorRecord({ id: "tutor-1", userId: "user-1" }));
  const langRepo = new FakeTutorLanguageRepository();
  return { tutorRepo, langRepo };
}

describe("Language use cases", () => {
  it("AddLanguage should create a language", async () => {
    const { tutorRepo, langRepo } = setup();
    const useCase = new AddLanguageUseCase(tutorRepo, langRepo);
    const result = await useCase.execute({ userId: "user-1", data: { language: "Hindi", proficiency: "FLUENT" } });
    expect(result.language).toBe("Hindi");
    expect(langRepo.records).toHaveLength(1);
  });

  it("AddLanguage should throw if tutor not found", async () => {
    const { tutorRepo, langRepo } = setup();
    const useCase = new AddLanguageUseCase(tutorRepo, langRepo);
    await expect(useCase.execute({ userId: "nope", data: { language: "Hindi" } })).rejects.toThrow(
      "Tutor profile not found",
    );
  });

  it("ListLanguages should return languages", async () => {
    const { tutorRepo, langRepo } = setup();
    await langRepo.create({ tutorId: "tutor-1", language: "Hindi" });
    const useCase = new ListLanguagesUseCase(tutorRepo, langRepo);
    const result = await useCase.execute({ userId: "user-1" });
    expect(result).toHaveLength(1);
  });

  it("ListLanguages should throw if tutor not found", async () => {
    const { tutorRepo, langRepo } = setup();
    const useCase = new ListLanguagesUseCase(tutorRepo, langRepo);
    await expect(useCase.execute({ userId: "nope" })).rejects.toThrow("Tutor profile not found");
  });

  it("RemoveLanguage should delete a language", async () => {
    const { tutorRepo, langRepo } = setup();
    const created = await langRepo.create({ tutorId: "tutor-1", language: "Hindi" });
    const useCase = new RemoveLanguageUseCase(tutorRepo, langRepo);
    await useCase.execute({ userId: "user-1", languageId: created.id });
    expect(langRepo.records).toHaveLength(0);
  });

  it("RemoveLanguage should throw if tutor not found", async () => {
    const { tutorRepo, langRepo } = setup();
    const useCase = new RemoveLanguageUseCase(tutorRepo, langRepo);
    await expect(useCase.execute({ userId: "nope", languageId: "x" })).rejects.toThrow(
      "Tutor profile not found",
    );
  });
});