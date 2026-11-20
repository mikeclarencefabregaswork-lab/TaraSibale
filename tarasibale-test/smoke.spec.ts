import { expect, test, type Page } from "@playwright/test";

async function chooseTheme(page: Page, value: "system" | "light" | "dark") {
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page.getByRole("group", { name: "Color scheme" }).getByText(value === "system" ? "System" : value === "light" ? "Light" : "Dark", { exact: true }).click();
}

test("appearance control shows a compact picker and closes with Escape", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await chooseTheme(page, "dark");
  const trigger = page.getByRole("button", { name: "Appearance", exact: true });
  await trigger.click();
  await expect(page.getByRole("radio", { name: "Dark", exact: true })).toBeChecked();
  await page.screenshot({ path: `/tmp/tarasibale-appearance-${testInfo.project.name}.png` });
  const box = await trigger.boundingBox();
  if (box) await page.screenshot({
    path: `/tmp/tarasibale-appearance-preview-${testInfo.project.name}.png`,
    clip: { x: Math.max(0, box.x + box.width - 190), y: Math.max(0, box.y - 10), width: 200, height: 260 },
  });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("group", { name: "Color scheme" })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("account notice contains keyboard focus and restores it after Escape", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Sign In", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const notice = page.getByRole("dialog", { name: "Portfolio account information" });
  await expect(notice).toBeVisible();
  const continueButton = notice.getByRole("button", { name: "Continue exploring" });
  await expect(continueButton).toBeFocused();
  await page.keyboard.press("Tab");
  // Browser chrome may receive a stop; page controls outside the modal must not.
  expect(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement?.closest("dialog"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(notice).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("storage denial still allows browsing and choosing a theme", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Guiwanon Beach", exact: true })).toBeVisible();
  await chooseTheme(page, "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByText("Demo data, privacy & credits", { exact: true }).click();
  await page.getByRole("button", { name: "Clear this browser’s demo preferences" }).click();
  await expect(page.getByRole("heading", { name: "Guiwanon Beach", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("theme overrides synchronize between tabs and clearing storage restores System", async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const second = await context.newPage();
  await second.emulateMedia({ colorScheme: "light" });
  await second.goto("/");
  await chooseTheme(second, "dark");
  await expect(page.getByRole("button", { name: "Appearance", exact: true })).toHaveAttribute("title", "Appearance: Dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await second.evaluate(() => localStorage.clear());
  await expect(page.getByRole("button", { name: "Appearance", exact: true })).toHaveAttribute("title", "Appearance: System");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("opening the deferred island guide retains its conversation after closing", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /TaraSibale Guide/ });
  await trigger.click();
  await page.getByRole("textbox", { name: "Ask about Sibale" }).fill("Which beaches can I visit?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("log", { name: "Guide conversation" }).getByText("Which beaches can I visit?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close island guide" }).click();
  await trigger.click();
  await expect(page.getByRole("log", { name: "Guide conversation" }).getByText("Which beaches can I visit?", { exact: true })).toBeVisible();
});

test("system theme follows the OS until an override is selected", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Guiwanon Beach", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("tara_sibale_theme"))).toBeNull();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await chooseTheme(page, "light");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.reload();
  await expect(page.getByRole("button", { name: "Appearance", exact: true })).toHaveAttribute("title", "Appearance: Light");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await chooseTheme(page, "system");
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(await page.evaluate(() => localStorage.getItem("tara_sibale_theme"))).toBeNull();
});

test("skip navigation preserves the current view and view changes announce their destination", async ({ page }) => {
  await page.goto("/#guide");
  await expect(page).toHaveTitle("Culture | TaraSibale");
  await page.getByRole("link", { name: "Skip to main content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page).toHaveURL(/#guide$/);
  await page.getByRole("link", { name: "TaraSibale home" }).click();
  await expect(page).toHaveURL(/#explore$/);
  await expect(page).toHaveTitle("TaraSibale | Sibale Island Travel Guide");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.getByRole("button", { name: "Plan Itinerary", exact: true }).click();
  await expect(page).toHaveTitle("Itinerary | TaraSibale");
  await expect(page.getByRole("heading", { name: "Travel Itinerary Builder" })).toBeFocused();
});

test("a visitor can browse the seeded catalog in portfolio mode", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const [catalog] = await Promise.all([
    page.waitForResponse("**/api/catalog"),
    page.goto("/", { waitUntil: "domcontentloaded" }),
  ]);
  expect(catalog.ok()).toBe(true);
  expect(await catalog.json()).toMatchObject({ portfolioMode: true });

  await expect(page).toHaveTitle("TaraSibale | Sibale Island Travel Guide");
  await expect(page.getByRole("heading", { name: "Guiwanon Beach", exact: true })).toBeVisible();
  await page.screenshot({ path: `/tmp/tarasibale-${testInfo.project.name}.png` });

  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  const accountNotice = page.getByRole("dialog", { name: "Portfolio account information" });
  await expect(accountNotice.getByRole("heading", { name: "Explore without an account" })).toBeVisible();
  await accountNotice.getByRole("button", { name: "Continue exploring" }).click();
  await expect(accountNotice).toBeHidden();
  expect(errors).toEqual([]);
});
