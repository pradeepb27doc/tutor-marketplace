import { describe, it, expect } from "vitest";
import { SearchTutorsUseCase } from "./search-tutors.use-case.js";
import { FakeTutorSearchRepository, buildSearchCard } from "@tutor-marketplace/testing";

describe("SearchTutorsUseCase", () => {
  it("should default sort to RATING and limit to 20", async () => {
    const searchRepo = new FakeTutorSearchRepository();
    searchRepo.result = { items: [buildSearchCard()], nextCursor: null };
    const useCase = new SearchTutorsUseCase(searchRepo);
    const result = await useCase.execute({});
    expect(result.data).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
    expect(searchRepo.lastQuery?.sort).toBe("RATING");
    expect(searchRepo.lastQuery?.limit).toBe(20);
  });

  it("should normalize limit below 1 to 1", async () => {
    const searchRepo = new FakeTutorSearchRepository();
    const useCase = new SearchTutorsUseCase(searchRepo);
    await useCase.execute({ limit: 0 });
    expect(searchRepo.lastQuery?.limit).toBe(1);
  });

  it("should cap limit at 50", async () => {
    const searchRepo = new FakeTutorSearchRepository();
    const useCase = new SearchTutorsUseCase(searchRepo);
    await useCase.execute({ limit: 999 });
    expect(searchRepo.lastQuery?.limit).toBe(50);
  });

  it("should floor fractional limits", async () => {
    const searchRepo = new FakeTutorSearchRepository();
    const useCase = new SearchTutorsUseCase(searchRepo);
    await useCase.execute({ limit: 15.9 });
    expect(searchRepo.lastQuery?.limit).toBe(15);
  });

  it("should pass through filters and cursor", async () => {
    const searchRepo = new FakeTutorSearchRepository();
    const useCase = new SearchTutorsUseCase(searchRepo);
    await useCase.execute({ subjectId: "math-1", city: "Mumbai", minRating: 4, sort: "PRICE_ASC", cursor: "abc" });
    expect(searchRepo.lastQuery?.filters).toMatchObject({ subjectId: "math-1", city: "Mumbai", minRating: 4 });
    expect(searchRepo.lastQuery?.sort).toBe("PRICE_ASC");
    expect(searchRepo.lastQuery?.cursor).toBe("abc");
  });

  it("should map card records to TutorCardDto", async () => {
    const searchRepo = new FakeTutorSearchRepository();
    const card = buildSearchCard({ isVerified: true, baseHourlyRate: "750.00" });
    searchRepo.result = { items: [card], nextCursor: "next-cursor" };
    const useCase = new SearchTutorsUseCase(searchRepo);
    const result = await useCase.execute({});
    expect(result.data[0].id).toBe(card.id);
    expect(result.data[0].isVerified).toBe(true);
    expect(result.data[0].baseHourlyRate).toBe("750.00");
    expect(result.nextCursor).toBe("next-cursor");
  });
});