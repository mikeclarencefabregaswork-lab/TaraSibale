import { expect, test } from "@playwright/test";

test("a visitor can browse the seeded catalog in portfolio mode", async ({ page }) => {
  const [catalog] = await Promise.all([
    page.waitForResponse("**/api/catalog"),
    page.goto("/", { waitUntil: "domcontentloaded" }),
  ]);
  expect(catalog.ok()).toBe(true);
  expect(await catalog.json()).toMatchObject({ portfolioMode: true });

  await expect(page).toHaveTitle("TaraSibale | Sibale Island Travel Guide");
  await expect(page.getByRole("heading", { name: "Guiwanon Beach", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  const accountNotice = page.getByRole("dialog", { name: "Portfolio account information" });
  await expect(accountNotice.getByRole("heading", { name: "Explore without an account" })).toBeVisible();
  await accountNotice.getByRole("button", { name: "Continue exploring" }).click();
  await expect(accountNotice).toBeHidden();
});
