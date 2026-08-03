import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { createSmokeTestApp, getAuthTokensService } from "./helpers.js";

const request = supertest;

describe("API Smoke Tests", () => {
  let app: INestApplication;
  let authTokensService: ReturnType<typeof getAuthTokensService>;

  beforeAll(async () => {
    app = await createSmokeTestApp();
    authTokensService = getAuthTokensService();
  });

  afterAll(async () => {
    await app.close();
  });

  // Helper: set the auth role that the guard will see
  function setAuthRole(role: string, sub = "test-user"): void {
    (authTokensService as any).verifyAccessToken = () => Promise.resolve({ sub, role });
  }

  // ---- Health ----
  describe("GET /v1/health", () => {
    it("should return 200 OK with health payload", async () => {
      const res = await request(app.getHttpServer()).get("/v1/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.service).toBe("api");
      expect(res.body.checkedAt).toBeDefined();
    });
  });

  // ---- Authentication ----
  describe("POST /v1/auth/login", () => {
    it("should be registered and accept requests", async () => {
      const res = await request(app.getHttpServer()).post("/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });
      expect([200, 400, 401, 500]).toContain(res.status);
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app.getHttpServer()).post("/v1/auth/login").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("POST /v1/auth/refresh", () => {
    it("should be registered and accept requests", async () => {
      const res = await request(app.getHttpServer()).post("/v1/auth/refresh").send({
        refreshToken: "test-token",
      });
      expect([200, 400, 401, 500]).toContain(res.status);
    });

    it("should return 400 when refresh token is missing", async () => {
      const res = await request(app.getHttpServer()).post("/v1/auth/refresh").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("POST /v1/auth/logout", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app.getHttpServer()).post("/v1/auth/logout");
      expect(res.status).toBe(401);
    });

    it("should be accessible with valid auth token", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .post("/v1/auth/logout")
        .set("Authorization", "Bearer valid-token");
      expect([204, 500]).toContain(res.status);
    });
  });

  // ---- Search (public) ----
  describe("GET /v1/search/tutors", () => {
    it("should return 200 OK for public search", async () => {
      const res = await request(app.getHttpServer()).get("/v1/search/tutors");
      expect(res.status).toBe(200);
    });

    it("should return 200 OK for search with filters", async () => {
      const res = await request(app.getHttpServer()).get(
        "/v1/search/tutors?subjectSlug=mathematics&city=Mumbai",
      );
      expect(res.status).toBe(200);
    });
  });

  describe("GET /v1/search/tutors/:tutorId", () => {
    it("should return 200 for valid tutor id", async () => {
      const res = await request(app.getHttpServer()).get("/v1/search/tutors/tutor-1");
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it("should return 404 for non-existent tutor", async () => {
      const res = await request(app.getHttpServer()).get("/v1/search/tutors/non-existent");
      expect(res.status).toBe(404);
    });
  });

  // ---- Bookings (protected) ----
  describe("GET /v1/bookings", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app.getHttpServer()).get("/v1/bookings");
      expect(res.status).toBe(401);
    });

    it("should be accessible with valid auth token (PARENT role)", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .get("/v1/bookings")
        .set("Authorization", "Bearer valid-token");
      expect(res.status).toBe(200);
    });
  });

  describe("POST /v1/bookings", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app.getHttpServer())
        .post("/v1/bookings")
        .send({ tutorId: "tutor-1", studentId: "student-1", subjectId: "subject-1" });
      expect(res.status).toBe(401);
    });

    it("should be accessible with valid auth token and booking data", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .post("/v1/bookings")
        .set("Authorization", "Bearer valid-token")
        .send({
          tutorId: "tutor-1",
          studentId: "student-1",
          subjectId: "subject-1",
          availabilitySlotId: "slot-1",
        });
      expect([201, 500]).toContain(res.status);
    });

    it("should return 400 when required fields are missing", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .post("/v1/bookings")
        .set("Authorization", "Bearer valid-token")
        .send({ tutorId: "tutor-1" });
      expect(res.status).toBe(400);
    });
  });

  // ---- Payments (protected) ----
  describe("GET /v1/payments", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app.getHttpServer()).get("/v1/payments");
      expect(res.status).toBe(401);
    });

    it("should be accessible with valid auth token (PARENT role)", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .get("/v1/payments")
        .set("Authorization", "Bearer valid-token");
      expect(res.status).toBe(200);
    });
  });

  describe("POST /v1/payments/orders", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app.getHttpServer())
        .post("/v1/payments/orders")
        .send({ bookingId: "booking-1" });
      expect(res.status).toBe(401);
    });

    it("should be accessible with valid auth token and booking id", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .post("/v1/payments/orders")
        .set("Authorization", "Bearer valid-token")
        .send({ bookingId: "booking-1", provider: "RAZORPAY" });
      expect([201, 500]).toContain(res.status);
    });

    it("should return 400 when bookingId is missing", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .post("/v1/payments/orders")
        .set("Authorization", "Bearer valid-token")
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("GET /v1/payments/:paymentId", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app.getHttpServer()).get("/v1/payments/payment-1");
      expect(res.status).toBe(401);
    });

    it("should be accessible with valid auth token", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .get("/v1/payments/payment-1")
        .set("Authorization", "Bearer valid-token");
      expect([200, 500]).toContain(res.status);
    });
  });

  // ---- Admin (protected, ADMIN/SUPPORT role) ----
  describe("GET /v1/admin/overview", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app.getHttpServer()).get("/v1/admin/overview");
      expect(res.status).toBe(401);
    });

    it("should be accessible with valid ADMIN auth token", async () => {
      setAuthRole("ADMIN", "admin-1");
      const res = await request(app.getHttpServer())
        .get("/v1/admin/overview")
        .set("Authorization", "Bearer admin-token");
      expect([200, 500]).toContain(res.status);
    });

    it("should return 403 with PARENT role (insufficient permissions)", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .get("/v1/admin/overview")
        .set("Authorization", "Bearer parent-token");
      expect(res.status).toBe(403);
    });
  });

  describe("GET /v1/admin/users", () => {
    it("should return 401 without auth token", async () => {
      const res = await request(app.getHttpServer()).get("/v1/admin/users");
      expect(res.status).toBe(401);
    });

    it("should be accessible with valid ADMIN auth token", async () => {
      setAuthRole("ADMIN", "admin-1");
      const res = await request(app.getHttpServer())
        .get("/v1/admin/users")
        .set("Authorization", "Bearer admin-token");
      expect([200, 500]).toContain(res.status);
    });

    it("should return 403 with PARENT role (insufficient permissions)", async () => {
      setAuthRole("PARENT");
      const res = await request(app.getHttpServer())
        .get("/v1/admin/users")
        .set("Authorization", "Bearer parent-token");
      expect(res.status).toBe(403);
    });
  });

  // ---- Webhook (public) ----
  describe("POST /v1/webhooks/razorpay", () => {
    it("should be registered and accept requests", async () => {
      const res = await request(app.getHttpServer())
        .post("/v1/webhooks/razorpay")
        .set("x-razorpay-signature", "test-signature")
        .send({ event: "payment.captured", payload: {} });
      expect([200, 500]).toContain(res.status);
    });
  });
});