import { describe, it, expect } from "vitest";
import {
  ListServiceAreasUseCase,
  AddServiceAreaUseCase,
  RemoveServiceAreaUseCase,
} from "./service-area.use-cases.js";
import {
  FakeTutorRepository,
  FakeTutorServiceAreaRepository,
  buildTutorRecord,
} from "@tutor-marketplace/testing";

function setup() {
  const tutorRepo = new FakeTutorRepository();
  tutorRepo.tutors.push(buildTutorRecord({ id: "tutor-1", userId: "user-1" }));
  const areaRepo = new FakeTutorServiceAreaRepository();
  return { tutorRepo, areaRepo };
}

describe("Service area use cases", () => {
  it("AddServiceArea should create a service area", async () => {
    const { tutorRepo, areaRepo } = setup();
    const useCase = new AddServiceAreaUseCase(tutorRepo, areaRepo);
    const result = await useCase.execute({ userId: "user-1", data: { city: "Mumbai", radiusKm: "10.00" } });
    expect(result.city).toBe("Mumbai");
    expect(areaRepo.records).toHaveLength(1);
  });

  it("AddServiceArea should throw if tutor not found", async () => {
    const { tutorRepo, areaRepo } = setup();
    const useCase = new AddServiceAreaUseCase(tutorRepo, areaRepo);
    await expect(useCase.execute({ userId: "nope", data: { city: "Mumbai" } })).rejects.toThrow(
      "Tutor profile not found",
    );
  });

  it("ListServiceAreas should return areas", async () => {
    const { tutorRepo, areaRepo } = setup();
    await areaRepo.create({ tutorId: "tutor-1", city: "Mumbai" });
    const useCase = new ListServiceAreasUseCase(tutorRepo, areaRepo);
    const result = await useCase.execute({ userId: "user-1" });
    expect(result).toHaveLength(1);
  });

  it("RemoveServiceArea should delete an area", async () => {
    const { tutorRepo, areaRepo } = setup();
    const created = await areaRepo.create({ tutorId: "tutor-1", city: "Mumbai" });
    const useCase = new RemoveServiceAreaUseCase(tutorRepo, areaRepo);
    await useCase.execute({ userId: "user-1", serviceAreaId: created.id });
    expect(areaRepo.records).toHaveLength(0);
  });

  it("RemoveServiceArea should throw if tutor not found", async () => {
    const { tutorRepo, areaRepo } = setup();
    const useCase = new RemoveServiceAreaUseCase(tutorRepo, areaRepo);
    await expect(useCase.execute({ userId: "nope", serviceAreaId: "x" })).rejects.toThrow(
      "Tutor profile not found",
    );
  });
});