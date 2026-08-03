import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchController } from "./search.controller.js";
import {
  SearchTutorsUseCase,
  GetPublicTutorDetailUseCase,
} from "@tutor-marketplace/application";

describe("SearchController", () => {
  let controller: SearchController;
  const mocks = {
    searchTutors: { execute: vi.fn() },
    getTutorDetail: { execute: vi.fn() },
  };

  const validTutorCard = {
    id: "tutor-1",
    displayName: "Dr. Sharma",
    headline: "Math Expert",
    city: "Mumbai",
    subjects: [{ id: "subject-1", name: "Mathematics", slug: "mathematics" }],
    baseHourlyRate: "500.00",
    currency: "INR",
    averageRating: "4.5",
    reviewCount: 12,
    experienceYears: 8,
    serviceModes: ["ONLINE"],
    isVerified: true,
    avatarUrl: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new SearchController(
      mocks.searchTutors as unknown as SearchTutorsUseCase,
      mocks.getTutorDetail as unknown as GetPublicTutorDetailUseCase,
    );
  });

  describe("searchTutors", () => {
    it("should return tutors with pagination", async () => {
      mocks.searchTutors.execute.mockResolvedValue({
        data: [validTutorCard],
        nextCursor: null,
      });
      const result = await controller.searchTutors({ limit: 20 } as any);
      expect(result.data).toHaveLength(1);
      expect(result.page.hasMore).toBe(false);
      expect(result.page.limit).toBe(20);
      expect(mocks.searchTutors.execute).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20 }),
      );
    });

    it("should support cursor pagination", async () => {
      mocks.searchTutors.execute.mockResolvedValue({
        data: [validTutorCard, { ...validTutorCard, id: "tutor-2" }],
        nextCursor: "tutor-2",
      });
      const result = await controller.searchTutors({ limit: 20, cursor: "tutor-1" } as any);
      expect(result.page.nextCursor).toBe("tutor-2");
      expect(result.page.hasMore).toBe(true);
      expect(mocks.searchTutors.execute).toHaveBeenCalledWith(expect.objectContaining({ cursor: "tutor-1" }));
    });

    it("should apply filters to search", async () => {
      mocks.searchTutors.execute.mockResolvedValue({ data: [], nextCursor: null });
      const query = {
        subjectSlug: "mathematics",
        grade: 5,
        curriculum: "CBSE",
        city: "Mumbai",
        serviceMode: "ONLINE",
        maxFee: 800,
        sort: "RATING",
      };
      await controller.searchTutors(query as any);
      expect(mocks.searchTutors.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectId: "mathematics",
          curricula: ["CBSE"],
          city: "Mumbai",
          mode: "ONLINE",
          priceMax: 800,
          sort: "RATING",
        }),
      );
    });

    it("should handle empty results", async () => {
      mocks.searchTutors.execute.mockResolvedValue({ data: [], nextCursor: null });
      const result = await controller.searchTutors({} as any);
      expect(result.data).toHaveLength(0);
      expect(result.page.nextCursor).toBeNull();
      expect(result.page.hasMore).toBe(false);
    });

    it("should map HOME_TUITION mode to OFFLINE", async () => {
      mocks.searchTutors.execute.mockResolvedValue({ data: [], nextCursor: null });
      await controller.searchTutors({ serviceMode: "HOME_TUITION" } as any);
      expect(mocks.searchTutors.execute).toHaveBeenCalledWith(expect.objectContaining({ mode: "OFFLINE" }));
    });

    it("should propagate search errors", async () => {
      mocks.searchTutors.execute.mockRejectedValue(new Error("Search service unavailable"));
      await expect(controller.searchTutors({} as any)).rejects.toThrow("Search service unavailable");
    });
  });

  describe("getTutorDetail", () => {
    it("should return public tutor detail", async () => {
      const detail = {
        id: "tutor-1",
        displayName: "Dr. Sharma",
        headline: "Math Expert",
        bio: "Expert tutor",
        city: "Mumbai",
        baseHourlyRate: "500.00",
        currency: "INR",
        averageRating: "4.5",
        reviewCount: 12,
        subjects: [],
        qualifications: [],
        languages: [],
        serviceAreas: [],
        verificationStatus: "VERIFIED",
        experienceYears: 8,
        createdAt: new Date().toISOString(),
      };
      mocks.getTutorDetail.execute.mockResolvedValue(detail);
      const result = await controller.getTutorDetail("tutor-1");
      expect(result).toEqual({ data: detail });
      expect(mocks.getTutorDetail.execute).toHaveBeenCalledWith({ tutorId: "tutor-1" });
    });

    it("should propagate tutor not found", async () => {
      mocks.getTutorDetail.execute.mockRejectedValue(new Error("Tutor not found"));
      await expect(controller.getTutorDetail("non-existent")).rejects.toThrow("Tutor not found");
    });
  });
});