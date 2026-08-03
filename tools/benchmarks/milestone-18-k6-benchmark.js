/**
 * Milestone 18: k6 Performance Benchmarks
 * 
 * Usage:
 *   k6 run tools/benchmarks/milestone-18-k6-benchmark.js
 * 
 * Environment variables:
 *   BASE_URL - API base URL (default: http://localhost:4000)
 *   TEST_USER_EMAIL - Email for authentication tests
 *   TEST_USER_PASSWORD - Password for authentication tests
 *   VUS - Virtual Users (default: 10)
 *   DURATION - Test duration (default: 30s)
 * 
 * Tests:
 *   1. Health endpoint
 *   2. Tutor Search (public)
 *   3. Tutor Profile (public)
 *   4. Authentication (login)
 *   5. Booking creation
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

// Custom metrics
const healthLatency = new Trend("health_latency", true);
const searchLatency = new Trend("search_latency", true);
const profileLatency = new Trend("profile_latency", true);
const authLatency = new Trend("auth_latency", true);
const bookingLatency = new Trend("booking_latency", true);

const failureRate = new Rate("failure_rate");
const requestsPerSecond = new Counter("requests_per_second");

// Configuration
const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";
const VUS = parseInt(__ENV.VUS || "10");
const DURATION = __ENV.DURATION || "30s";
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || "test@example.com";
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || "testpassword123";

// Sample tutor IDs for profile testing (will be populated dynamically)
const SAMPLE_TUTOR_QUERIES = [
  "",
  "?subjectId=math",
  "?city=Mumbai",
  "?city=Mumbai&subjectId=math",
  "?sort=PRICE_ASC",
  "?mode=ONLINE",
  "?verifiedOnly=true",
  "?sort=RATING&mode=HYBRID",
];

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    health_latency: ["p(95)<200", "p(99)<500"],
    search_latency: ["p(95)<500", "p(99)<1000"],
    profile_latency: ["p(95)<300", "p(99)<800"],
    auth_latency: ["p(95)<500", "p(99)<1000"],
    failure_rate: ["rate<0.01"], // Less than 1% failure rate
  },
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max"],
};

let authToken = "";
let tutorIds = [];

export function setup() {
  // Attempt to log in and get a token
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "auth:login" },
    },
  );

  if (loginRes.status === 200) {
    try {
      const body = JSON.parse(loginRes.body);
      authToken = body.data?.accessToken || body.accessToken || "";
      console.log("Authentication successful, token obtained");
    } catch {
      console.log("Could not parse auth response");
    }
  } else {
    console.log(`Auth returned ${loginRes.status} - proceeding without token`);
  }

  // Fetch initial search to get tutor IDs for profile tests
  const searchRes = http.get(`${BASE_URL}/search/tutors?limit=5`, {
    tags: { name: "search:setup" },
  });

  if (searchRes.status === 200) {
    try {
      const body = JSON.parse(searchRes.body);
      const items = body.data || [];
      tutorIds = items.map((t) => t.id).filter(Boolean);
      console.log(`Found ${tutorIds.length} tutor IDs for profile testing`);
    } catch {
      console.log("Could not parse search results");
    }
  }

  return { authToken, tutorIds };
}

export default function (data) {
  const token = data.authToken || authToken;

  // Test 1: Health endpoint
  group("Health", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/health`, {
      tags: { name: "health" },
    });
    healthLatency.add(Date.now() - start);
    check(res, {
      "health: status 200": (r) => r.status === 200,
    }) || failureRate.add(1);
    requestsPerSecond.add(1);

    sleep(0.1);
  });

  // Test 2: Tutor Search
  group("Tutor Search", () => {
    for (const query of SAMPLE_TUTOR_QUERIES) {
      const start = Date.now();
      const res = http.get(`${BASE_URL}/search/tutors${query}`, {
        tags: { name: "search" },
      });
      searchLatency.add(Date.now() - start);
      check(res, {
        "search: status 200": (r) => r.status === 200,
      }) || failureRate.add(1);
      requestsPerSecond.add(1);

      sleep(0.2);
    }
  });

  // Test 3: Tutor Profile
  group("Tutor Profile", () => {
    const availableIds = data.tutorIds || tutorIds;
    for (const tutorId of availableIds.slice(0, 3)) {
      const start = Date.now();
      const res = http.get(`${BASE_URL}/tutors/${tutorId}`, {
        tags: { name: "tutor-profile" },
      });
      profileLatency.add(Date.now() - start);
      check(res, {
        "profile: status 200 or 404": (r) => r.status === 200 || r.status === 404,
      }) || failureRate.add(1);
      requestsPerSecond.add(1);

      sleep(0.15);
    }
  });

  // Test 4: Authentication
  group("Authentication", () => {
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
      {
        headers: { "Content-Type": "application/json" },
        tags: { name: "auth:login" },
      },
    );
    authLatency.add(Date.now() - start);
    check(res, {
      "auth: status 200 or 401": (r) => r.status === 200 || r.status === 401,
    }) || failureRate.add(1);
    requestsPerSecond.add(1);

    sleep(0.3);
  });

  // Test 5: Booking creation (only if authenticated)
  if (token && data.tutorIds && data.tutorIds.length > 0) {
    group("Booking Creation", () => {
      const tutorId = data.tutorIds[0];
      const start = Date.now();
      const res = http.post(
        `${BASE_URL}/bookings`,
        JSON.stringify({
          tutorId: tutorId,
          studentId: "test-student-id",
          subjectId: "test-subject-id",
          startAt: new Date(Date.now() + 86400000).toISOString(),
          endAt: new Date(Date.now() + 90000000).toISOString(),
          durationMinutes: 60,
          serviceMode: "ONLINE",
          priceAmount: "500",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          tags: { name: "booking:create" },
        },
      );
      bookingLatency.add(Date.now() - start);
      check(res, {
        "booking: status 200 or 400 or 401": (r) =>
          r.status === 200 || r.status === 400 || r.status === 401,
      }) || failureRate.add(1);
      requestsPerSecond.add(1);

      sleep(0.5);
    });
  }
}

export function teardown(data) {
  console.log("Benchmark complete");
  console.log(`Searched tutors with ${SAMPLE_TUTOR_QUERIES.length} query variations`);
  console.log(`Auth token obtained: ${!!(data.authToken || authToken)}`);
}

/**
 * Summary Report Template:
 * 
 * | Metric | avg | p95 | p99 | max | req/s |
 * |--------|-----|-----|-----|-----|-------|
 * | Health |     |     |     |     |       |
 * | Search |     |     |     |     |       |
 * | Profile|     |     |     |     |       |
 * | Auth   |     |     |     |     |       |
 * | Booking|     |     |     |     |       |
 */