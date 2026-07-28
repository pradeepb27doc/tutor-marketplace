import { type Page, type Response } from "@playwright/test";

/**
 * Navigate to a path and wait for the network to settle.
 */
export async function navigateTo(page: Page, path: string): Promise<Response | null> {
  return page.goto(path, { waitUntil: "networkidle" });
}

/**
 * Check the response was not a server error.
 */
export function isSuccess(response: Response | null): boolean {
  if (!response) return false;
  return response.status() < 500;
}