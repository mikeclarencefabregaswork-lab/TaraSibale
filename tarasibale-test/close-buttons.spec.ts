import { expect, test, type Locator } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} close buttons`, () => {
    test.use({ colorScheme });

    test("panel and dialog close controls use consistent sizing and dismiss their surface", async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      const closeSurface = async (surface: Locator, label: string) => {
        const close = surface.getByRole("button", { name: label, exact: true });
        await expect(close).toBeVisible();
        await expect(close).toHaveAttribute("type", "button");
        await expect(close).toHaveCSS("width", "44px");
        await expect(close).toHaveCSS("height", "44px");
        await expect(close).toHaveCSS("border-top-width", "1px");
        await expect(close.locator("svg")).toHaveCSS("width", "20px");
        await expect(close.locator("svg")).toHaveAttribute("aria-hidden", "true");
        const box = (await close.boundingBox())!;
        const viewport = page.viewportSize()!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
        expect(await close.evaluate(node => parseFloat(getComputedStyle(node).borderRadius))).toBeGreaterThanOrEqual(22);
        await close.focus();
        await page.keyboard.press("Tab");
        await page.keyboard.press("Shift+Tab");
        await expect(close).toBeFocused();
        await expect(close).toHaveCSS("outline-style", "solid");
        if (colorScheme === "dark" && testInfo.project.name === "phone") {
          await close.screenshot({ path: testInfo.outputPath(`${label.replaceAll(" ", "-")}.png`) });
        }
        await close.click();
        await expect(surface).toBeHidden();
      };

      await page.goto("/#explore");
      await page.getByRole("button", { name: "Island Notifications", exact: true }).click();
      await closeSurface(page.getByRole("dialog", { name: "Notification Center" }), "Close notifications");

      await page.getByRole("button", { name: "Weather & sea conditions", exact: true }).click();
      await closeSurface(page.getByRole("dialog", { name: "Weather & sea conditions" }), "Close weather details");

      await page.getByRole("button", { name: "View Details", exact: true }).first().click();
      await closeSurface(page.getByRole("dialog", { name: "Guiwanon Beach", exact: true }), "Close attraction details");

      await page.getByRole("button", { name: "Sign In", exact: true }).click();
      await closeSurface(page.getByRole("dialog", { name: /^(Portfolio account information|TaraSibale account)$/ }), "Close account dialog");

      await page.getByRole("button", { name: /TaraSibale Guide/ }).click();
      await closeSurface(page.getByRole("dialog", { name: "TaraSibale Island Guide" }), "Close island guide");

      await page.goto("/#reviews");
      await page.getByRole("button", { name: /Write a Review/i }).click();
      await closeSurface(page.getByRole("dialog", { name: "Write a Review for Concepcion" }), "Close review form");

      await page.goto("/#social");
      await page.getByRole("button", { name: "Share Your Island Moment", exact: true }).click();
      await closeSurface(page.getByRole("dialog", { name: "Share Your Concepcion Experience" }), "Close post composer");

      await page.goto("/#map");
      await page.getByRole("button", { name: "Trails & Places", exact: true }).click();
      await page.getByTitle("Open Terrain Layer Controls & Feature Toggles").click();
      const layers = page.getByRole("button", { name: "Close layers panel", exact: true }).locator("..").locator("..");
      await closeSurface(layers, "Close layers panel");

      if (page.viewportSize()!.width < 768) {
        await page.goto("/#explore");
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole("button", { name: "More", exact: true }).click();
        await closeSurface(page.getByRole("dialog", { name: "All Island Tools" }), "Close sheet");
      }
      expect(errors).toEqual([]);
    });
  });
}

test("composer close stays disabled until a pending submission finishes", async ({ page }) => {
  let releaseResponse = () => {};
  const pendingResponse = new Promise<void>(resolve => { releaseResponse = resolve; });
  await page.route("**/api/social-posts", async route => {
    await pendingResponse;
    await route.fulfill({ status: 503, json: { error: "Controlled test failure" } });
  });
  await page.goto("/#social");
  await page.getByRole("button", { name: "Share Your Island Moment", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Share Your Concepcion Experience" });
  await dialog.getByLabel("Caption / Story", { exact: false }).fill("Close-button regression example");
  await dialog.getByRole("button", { name: "Post to Community Stream", exact: true }).click();
  const close = dialog.getByRole("button", { name: "Close post composer", exact: true });
  await expect(close).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  releaseResponse();
  await expect(close).toBeEnabled();
  await close.click();
  await expect(dialog).toBeHidden();
  const dismiss = page.getByRole("region", { name: "Notifications", exact: true })
    .getByRole("button", { name: "Dismiss notification", exact: true });
  await expect(dismiss).toHaveCSS("width", "44px");
  await expect(dismiss).toHaveCSS("height", "44px");
  await dismiss.click();
  await expect(dismiss).toBeHidden();
});
