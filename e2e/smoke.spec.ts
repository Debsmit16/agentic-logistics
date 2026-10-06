import { test, expect } from "@playwright/test";

test.describe("public track", () => {
  test("track page loads", async ({ page }) => {
    await page.goto("/track");
    await expect(page.getByRole("heading", { name: /track parcel/i })).toBeVisible();
  });
});

test.describe("auth", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();
  });
});
