import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} category filters`, () => {
    test.use({ colorScheme });

    for (const filter of [
      { route: "/#explore", all: "All Places", other: "White Beaches 🏖️" },
      { route: "/#stay", all: "All Stays", other: "Eco-Resorts 🏝️" },
    ]) {
      test(`${filter.all} has a visible highlight on initial load and refresh`, async ({ page }) => {
        await page.goto(filter.route);
        const all = page.getByRole("button", { name: filter.all, exact: true });
        const highlight = all.locator("..").locator(".sliding-filter-highlight");
        const checkHighlight = async (button: typeof all) => {
          await button.scrollIntoViewIfNeeded();
          await expect(button).toHaveAttribute("aria-pressed", "true");
          await expect(highlight).toHaveCSS("opacity", "1");
          await expect.poll(async () => {
            const buttonBox = await button.boundingBox();
            const highlightBox = await highlight.boundingBox();
            return !!buttonBox && !!highlightBox &&
              Math.abs(buttonBox.x - highlightBox.x) < 2 &&
              Math.abs(buttonBox.y - highlightBox.y) < 2 &&
              Math.abs(buttonBox.width - highlightBox.width) < 2 &&
              Math.abs(buttonBox.height - highlightBox.height) < 2;
          }).toBe(true);
        };

        await checkHighlight(all);
        await page.reload();
        await checkHighlight(all);
        const other = page.getByRole("button", { name: filter.other, exact: true });
        await other.click();
        await checkHighlight(other);
        await all.click();
        await checkHighlight(all);
      });
    }
  });
}
