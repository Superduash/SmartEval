import { expect, test } from "@playwright/test";

test("login and register pages render", async ({ page }: { page: any }) => {
  await page.goto("/auth/login");
  await expect(page.getByText("Sign In")).toBeVisible();

  await page.goto("/auth/register");
  await expect(page.getByText("Create Account")).toBeVisible();
});
