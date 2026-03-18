import { test, expect } from "@playwright/test";

test("admin can create product", async ({ page }) => {
  await page.goto("http://localhost:3000/admin/products");

  await page.fill("#name", "Test Product");
  await page.fill("#price", "100");

  await page.click("button[type=submit]");

  await expect(page.locator("text=Test Product")).toBeVisible();
});
