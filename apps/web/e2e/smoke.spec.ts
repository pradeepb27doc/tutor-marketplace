import { test, expect } from "@playwright/test";
import { navigateTo, isSuccess } from "./helpers/navigation";

test.describe("Smoke tests – public pages", () => {
  test("Landing page loads", async ({ page }) => {
    const resp = await navigateTo(page, "/");
    expect(isSuccess(resp)).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("Login page loads", async ({ page }) => {
    const resp = await navigateTo(page, "/login");
    expect(isSuccess(resp)).toBe(true);
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
  });

  test("Search page loads", async ({ page }) => {
    const resp = await navigateTo(page, "/search");
    expect(isSuccess(resp)).toBe(true);
  });

  test("Tutor profile page loads", async ({ page }) => {
    const resp = await navigateTo(page, "/tutors/placeholder-id");
    expect(isSuccess(resp)).toBe(true);
  });

  test("Booking page loads", async ({ page }) => {
    const resp = await navigateTo(page, "/booking");
    expect(isSuccess(resp)).toBe(true);
  });
});

test.describe("Smoke tests – protected route guards", () => {
  test("Parent dashboard redirects unauthenticated users", async ({ page }) => {
    const resp = await navigateTo(page, "/dashboard");
    // Should redirect to /login (status 200 after client redirect)
    expect(isSuccess(resp)).toBe(true);
    // The URL should have changed to /login or contain returnTo
    await page.waitForURL(/\/login/);
  });

  test("Tutor dashboard redirects unauthenticated users", async ({ page }) => {
    const resp = await navigateTo(page, "/tutor/dashboard");
    expect(isSuccess(resp)).toBe(true);
    await page.waitForURL(/\/login/);
  });

  test("Admin dashboard redirects unauthenticated users", async ({ page }) => {
    const resp = await navigateTo(page, "/admin/dashboard");
    expect(isSuccess(resp)).toBe(true);
    await page.waitForURL(/\/login/);
  });
});