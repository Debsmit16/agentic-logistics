import { test, expect } from "@playwright/test";

const runAcceptance =
  Boolean(process.env.E2E_OWNER_EMAIL) && Boolean(process.env.E2E_OWNER_PASSWORD);

(runAcceptance ? test.describe : test.describe.skip)("acceptance lifecycle", () => {
  test("owner can reach dashboard after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/phone \/ email/i).fill(process.env.E2E_OWNER_EMAIL!);
    await page.getByLabel(/^password$/i).fill(process.env.E2E_OWNER_PASSWORD!);
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test("warehouse hub loads when authenticated", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/phone \/ email/i).fill(process.env.E2E_OWNER_EMAIL!);
    await page.getByLabel(/^password$/i).fill(process.env.E2E_OWNER_PASSWORD!);
    await page.getByRole("button", { name: /log in/i }).click();
    await page.goto("/warehouse");
    await expect(page.getByRole("heading", { name: /warehouse/i })).toBeVisible({
      timeout: 15000,
    });
  });
});
