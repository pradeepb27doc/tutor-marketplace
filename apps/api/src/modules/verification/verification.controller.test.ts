import { describe, it, expect, vi, beforeEach } from "vitest";
import { VerificationController } from "./verification.controller.js";
import {
  GetVerificationStatusUseCase,
  UploadVerificationDocumentUseCase,
  SubmitVerificationUseCase,
  ListVerificationCasesUseCase,
  GetVerificationCaseUseCase,
  ApproveVerificationUseCase,
  RejectVerificationUseCase,
  RequestChangesVerificationUseCase,
} from "@tutor-marketplace/application";

describe("VerificationController", () => {
  let controller: VerificationController;
  const mocks = {
    getStatus: { execute: vi.fn() },
    uploadDocument: { execute: vi.fn() },
    submit: { execute: vi.fn() },
    listCases: { execute: vi.fn() },
    getCase: { execute: vi.fn() },
    approve: { execute: vi.fn() },
    reject: { execute: vi.fn() },
    requestChanges: { execute: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new VerificationController(
      mocks.getStatus as unknown as GetVerificationStatusUseCase,
      mocks.uploadDocument as unknown as UploadVerificationDocumentUseCase,
      mocks.submit as unknown as SubmitVerificationUseCase,
      mocks.listCases as unknown as ListVerificationCasesUseCase,
      mocks.getCase as unknown as GetVerificationCaseUseCase,
      mocks.approve as unknown as ApproveVerificationUseCase,
      mocks.reject as unknown as RejectVerificationUseCase,
      mocks.requestChanges as unknown as RequestChangesVerificationUseCase,
    );
  });

  // ---- Tutor-facing ----

  describe("getStatus", () => {
    it("should return verification status", async () => {
      const status = {
        tutorId: "tutor-1",
        status: "PENDING",
        checks: [{ type: "GOVERNMENT_ID", status: "PENDING", submittedAt: null, reviewedAt: null, rejectionReason: null, documents: [] }],
      };
      mocks.getStatus.execute.mockResolvedValue(status);
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      const result = await controller.getStatus(req);
      expect(result).toEqual({ data: status });
      expect(mocks.getStatus.execute).toHaveBeenCalledWith({ userId: "tutor-1" });
    });

    it("should propagate not-found error", async () => {
      mocks.getStatus.execute.mockRejectedValue(new Error("Verification record not found"));
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      await expect(controller.getStatus(req)).rejects.toThrow("Verification record not found");
    });
  });

  describe("uploadDocument", () => {
    it("should upload a verification document", async () => {
      const doc = {
        id: "doc-1",
        verificationCheckId: null,
        type: "GOVERNMENT_ID",
        status: "PENDING",
        fileKey: "kyc/GOVERNMENT_ID/abc.pdf",
        originalFileName: "aadhaar.pdf",
        mimeType: "application/pdf",
        uploadedAt: new Date(),
        expiresAt: new Date("2030-01-01T00:00:00.000Z"),
      };
      mocks.uploadDocument.execute.mockResolvedValue(doc);
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      const result = await controller.uploadDocument(req, "GOVERNMENT_ID", {
        fileKey: "kyc/GOVERNMENT_ID/abc.pdf",
        originalFileName: "aadhaar.pdf",
        mimeType: "application/pdf",
        expiresAt: "2030-01-01T00:00:00.000Z",
      } as any);
      expect(result.data.type).toBe("GOVERNMENT_ID");
      expect(mocks.uploadDocument.execute).toHaveBeenCalledWith({
        userId: "tutor-1",
        data: expect.objectContaining({
          fileKey: "kyc/GOVERNMENT_ID/abc.pdf",
          type: "GOVERNMENT_ID",
          expiresAt: expect.any(Date),
        }),
      });
    });

    it("should upload document without expiresAt", async () => {
      const doc = {
        id: "doc-2",
        verificationCheckId: null,
        type: "EDUCATION",
        status: "PENDING",
        fileKey: "kyc/EDUCATION/xyz.pdf",
        originalFileName: null,
        mimeType: null,
        uploadedAt: new Date(),
        expiresAt: null,
      };
      mocks.uploadDocument.execute.mockResolvedValue(doc);
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      await controller.uploadDocument(req, "EDUCATION", { fileKey: "kyc/EDUCATION/xyz.pdf" } as any);
      expect(mocks.uploadDocument.execute).toHaveBeenCalledWith({
        userId: "tutor-1",
        data: expect.objectContaining({
          type: "EDUCATION",
          expiresAt: null,
        }),
      });
    });

    it("should propagate invalid check type error", async () => {
      mocks.uploadDocument.execute.mockRejectedValue(new Error("Unsupported verification check type"));
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      await expect(
        controller.uploadDocument(req, "BAD_TYPE" as any, { fileKey: "kyc/BAD_TYPE/x.pdf" } as any),
      ).rejects.toThrow("Unsupported verification");
    });
  });

  describe("submit", () => {
    it("should submit verification for review", async () => {
      mocks.submit.execute.mockResolvedValue({ tutorId: "tutor-1", status: "PENDING_REVIEW" });
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      const result = await controller.submit(req);
      expect(result.data.status).toBe("PENDING_REVIEW");
      expect(mocks.submit.execute).toHaveBeenCalledWith({ userId: "tutor-1" });
    });

    it("should propagate submission error when documents required", async () => {
      mocks.submit.execute.mockRejectedValue(new Error("Cannot submit: required documents missing"));
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      await expect(controller.submit(req)).rejects.toThrow("documents missing");
    });
  });

  // ---- Admin/SUPPORT-facing ----

  describe("listCases", () => {
    it("should list pending verification cases", async () => {
      const caseSummary = {
        tutorId: "tutor-1",
        status: "PENDING",
        city: "Mumbai",
        headline: "Math Expert",
        createdAt: new Date(),
        pendingCheckTypes: ["GOVERNMENT_ID"],
      };
      mocks.listCases.execute.mockResolvedValue({
        data: [caseSummary],
        page: { nextCursor: null, hasMore: false, limit: 20 },
      });
      const result = await controller.listCases({ cursor: undefined, limit: 20 } as any);
      expect(result.data).toHaveLength(1);
      expect(result.page.hasMore).toBe(false);
      expect(mocks.listCases.execute).toHaveBeenCalledWith({ cursor: null, limit: 20 });
    });

    it("should pass through cursor and limit", async () => {
      mocks.listCases.execute.mockResolvedValue({
        data: [],
        page: { nextCursor: null, hasMore: false, limit: 20 },
      });
      await controller.listCases({ cursor: "tutor-xyz", limit: 50 } as any);
      expect(mocks.listCases.execute).toHaveBeenCalledWith({ cursor: "tutor-xyz", limit: 50 });
    });

    it("should handle empty verification queue", async () => {
      mocks.listCases.execute.mockResolvedValue({
        data: [],
        page: { nextCursor: null, hasMore: false, limit: 20 },
      });
      const result = await controller.listCases({} as any);
      expect(result.data).toHaveLength(0);
      expect(result.page.hasMore).toBe(false);
    });

    it("should propagate repository error", async () => {
      mocks.listCases.execute.mockRejectedValue(new Error("Database unavailable"));
      await expect(controller.listCases({} as any)).rejects.toThrow("Database unavailable");
    });
  });

  describe("getCase", () => {
    it("should return verification case detail", async () => {
      const caseDetail = {
        tutorId: "tutor-1",
        tutorUserId: "user-1",
        status: "PENDING",
        city: "Mumbai",
        headline: "Math Expert",
        createdAt: new Date(),
        checks: [{ type: "GOVERNMENT_ID", status: "PENDING", submittedAt: null, reviewedAt: null, rejectionReason: null, documents: [] }],
      };
      mocks.getCase.execute.mockResolvedValue(caseDetail);
      const result = await controller.getCase("tutor-1");
      expect(result.data.tutorId).toBe("tutor-1");
      expect(mocks.getCase.execute).toHaveBeenCalledWith({ tutorId: "tutor-1" });
    });

    it("should propagate case not found for invalid id", async () => {
      mocks.getCase.execute.mockRejectedValue(new Error("Verification case not found"));
      await expect(controller.getCase("non-existent")).rejects.toThrow("not found");
    });
  });

  describe("approve", () => {
    it("should approve a verification case", async () => {
      mocks.approve.execute.mockResolvedValue({ tutorId: "tutor-1", status: "APPROVED", approvedAt: new Date() });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.approve(req, "tutor-1");
      expect(result.data.status).toBe("APPROVED");
      expect(mocks.approve.execute).toHaveBeenCalledWith({
        tutorId: "tutor-1",
        reviewerUserId: "admin-1",
      });
    });

    it("should propagate approval error for invalid case", async () => {
      mocks.approve.execute.mockRejectedValue(new Error("Verification case not found"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(controller.approve(req, "bad-id")).rejects.toThrow("not found");
    });
  });

  describe("reject", () => {
    it("should reject a verification case", async () => {
      mocks.reject.execute.mockResolvedValue({ tutorId: "tutor-1", status: "REJECTED", rejectionReason: "Fake documents" });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.reject(req, "tutor-1", { rejectionReason: "Fake documents" } as any);
      expect(result.data.status).toBe("REJECTED");
      expect(mocks.reject.execute).toHaveBeenCalledWith({
        tutorId: "tutor-1",
        reviewerUserId: "admin-1",
        rejectionReason: "Fake documents",
      });
    });

    it("should propagate rejection error for invalid id", async () => {
      mocks.reject.execute.mockRejectedValue(new Error("Verification case not found"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(
        controller.reject(req, "bad-id", { rejectionReason: "reason" } as any),
      ).rejects.toThrow("not found");
    });
  });

  describe("requestChanges", () => {
    it("should request changes on a verification case", async () => {
      mocks.requestChanges.execute.mockResolvedValue({ tutorId: "tutor-1", status: "CHANGES_REQUESTED" });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      const result = await controller.requestChanges(req, "tutor-1", { note: "Need clearer photo" } as any);
      expect(result.data.status).toBe("CHANGES_REQUESTED");
      expect(mocks.requestChanges.execute).toHaveBeenCalledWith({
        tutorId: "tutor-1",
        reviewerUserId: "admin-1",
        note: "Need clearer photo",
      });
    });

    it("should pass null note when not provided", async () => {
      mocks.requestChanges.execute.mockResolvedValue({ tutorId: "tutor-1", status: "CHANGES_REQUESTED" });
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await controller.requestChanges(req, "tutor-1", {} as any);
      expect(mocks.requestChanges.execute).toHaveBeenCalledWith({
        tutorId: "tutor-1",
        reviewerUserId: "admin-1",
        note: null,
      });
    });

    it("should propagate error for invalid id", async () => {
      mocks.requestChanges.execute.mockRejectedValue(new Error("Verification case not found"));
      const req = { user: { id: "admin-1", role: "ADMIN" } } as any;
      await expect(
        controller.requestChanges(req, "bad-id", { note: "note" } as any),
      ).rejects.toThrow("not found");
    });
  });

  // ---- Authorization / Permission checks ----

  describe("permission checks", () => {
    it("should reject non-admin access to listCases", async () => {
      mocks.listCases.execute.mockRejectedValue(new Error("Forbidden"));
      await expect(controller.listCases({} as any)).rejects.toThrow("Forbidden");
    });

    it("should reject non-admin access to approve", async () => {
      mocks.approve.execute.mockRejectedValue(new Error("Insufficient permissions"));
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      await expect(controller.approve(req, "tutor-1")).rejects.toThrow("Insufficient permissions");
    });

    it("should reject non-admin access to reject", async () => {
      mocks.reject.execute.mockRejectedValue(new Error("Insufficient permissions"));
      const req = { user: { id: "tutor-1", role: "TUTOR" } } as any;
      await expect(
        controller.reject(req, "tutor-1", { rejectionReason: "x" } as any),
      ).rejects.toThrow("Insufficient permissions");
    });
  });
});
