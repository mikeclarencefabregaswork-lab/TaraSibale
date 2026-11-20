import { expect, test } from "@playwright/test";

async function openFixture(page: import("@playwright/test").Page) {
  await page.route("**/overlay-fixture", route => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1">
      <script type="module">
        import RefreshRuntime from "/@react-refresh";
        RefreshRuntime.injectIntoGlobalHook(window);
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => type => type;
        window.__vite_plugin_react_preamble_installed__ = true;
      </script>
      </head><body><div id="root"></div><script type="module" src="/test/overlay-fixture.tsx"></script></body></html>`,
  }));
  await page.goto("/overlay-fixture");
}

test("contextual panels dismiss with Escape and stay inside the viewport", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const trigger = page.getByRole("button", { name: "Island Notifications", exact: true });
  await trigger.click();
  const panel = page.getByRole("dialog", { name: "Notification Center" });
  await expect(panel).toBeVisible();
  expect(await panel.evaluate(node => node.matches(":popover-open"))).toBe(true);
  const box = (await panel.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(1, viewport.height / 2);
  await expect(panel).toBeHidden();
  if (testInfo.project.name !== "mobile-chromium") {
    await page.getByRole("button", { name: "More", exact: true }).click();
    await expect(page.getByText("More Island Tools", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("More Island Tools", { exact: true })).toBeHidden();
  }
});

test("mobile navigation sheet contains focus and returns to More", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile sheet only");
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "More", exact: true });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "All Island Tools" });
  await expect(sheet).toBeVisible();
  expect(await sheet.evaluate(node => node.matches(":modal"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("review form is a modal and restores its opener", async ({ page }) => {
  await page.goto("/#reviews");
  const trigger = page.getByRole("button", { name: /Write a Review/i });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Write a Review for Concepcion" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(node => node.matches(":modal"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("modal backdrop dismissal respects a busy form and pointer drags", async ({ page }) => {
  await openFixture(page);
  const trigger = page.getByRole("button", { name: "Open fixture dialog" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Fixture form" });
  await expect(page.getByRole("textbox", { name: "Message" })).toBeFocused();
  const box = (await dialog.boundingBox())!;
  await page.mouse.move(box.x + 40, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(1, 1);
  await page.mouse.up();
  await expect(dialog).toBeVisible();
  await page.getByRole("checkbox", { name: "Operation in progress" }).check();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await page.mouse.click(1, 1);
  await expect(dialog).toBeVisible();
  await page.getByRole("checkbox", { name: "Operation in progress" }).uncheck();
  await page.mouse.click(1, 1);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("anchored panels fit near each viewport corner", async ({ page }) => {
  await openFixture(page);
  const trigger = page.getByRole("button", { name: "Open fixture panel" });
  for (const corner of ["top-right", "top-left", "bottom-left", "bottom-right"]) {
    await trigger.evaluate((node, corner) => {
      node.style.top = corner.startsWith("top") ? "0" : "auto";
      node.style.bottom = corner.startsWith("bottom") ? "0" : "auto";
      node.style.left = corner.endsWith("left") ? "0" : "auto";
      node.style.right = corner.endsWith("right") ? "0" : "auto";
    }, corner);
    await trigger.click();
    const panel = page.locator("#fixture-panel");
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
  }
});

test("browsers without Popover retain a dismissible usable panel", async ({ page }) => {
  await page.addInitScript(() => { delete (HTMLElement.prototype as { popover?: string }).popover; });
  await openFixture(page);
  const trigger = page.getByRole("button", { name: "Open fixture panel" });
  await trigger.click();
  const link = page.getByRole("link", { name: "Fixture link" });
  await expect(link).toBeVisible();
  await link.focus();
  await page.keyboard.press("Escape");
  await expect(link).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(1, 1);
  await expect(link).toBeHidden();
});

test("closing a modal button returns focus to its opener", async ({ page }) => {
  await openFixture(page);
  const trigger = page.getByRole("button", { name: "Open fixture dialog" });
  await trigger.click();
  await page.getByRole("button", { name: "Close fixture", exact: true }).click();
  await expect(trigger).toBeFocused();
});

for (const fallback of [false, true]) {
  test(`nested appearance dismissal keeps its parent open (${fallback ? "fallback" : "native"})`, async ({ page }) => {
    if (fallback) await page.addInitScript(() => { delete (HTMLElement.prototype as { popover?: string }).popover; });
    await openFixture(page);
    await page.getByRole("button", { name: "Open fixture panel" }).click();
    const appearance = page.getByRole("button", { name: "Appearance", exact: true });
    await appearance.click();
    await page.getByRole("radio", { name: "Dark", exact: true }).focus();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("group", { name: "Color scheme" })).toBeHidden();
    await expect(page.getByRole("link", { name: "Fixture link" })).toBeVisible();
    await appearance.click();
    await page.getByText("Light", { exact: true }).click();
    await expect(page.getByRole("link", { name: "Fixture link" })).toBeVisible();
  });
}

test("panels stay centered when CSS anchor positioning is unavailable", async ({ page }) => {
  await page.route("**/src/index.css", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replaceAll("(position-area: block-end)", "(unknown-property: none)") });
  });
  await openFixture(page);
  await page.getByRole("button", { name: "Open fixture panel" }).click();
  const box = (await page.locator("#fixture-panel").boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.x).toBeCloseTo((viewport.width - box.width) / 2, 0);
  expect(box.y).toBeCloseTo((viewport.height - box.height) / 2, 0);
});

test("guide focus enters the conversation and returns to either opener", async ({ page }) => {
  await page.goto("/");
  for (const trigger of [
    page.getByRole("button", { name: /TaraSibale Guide/ }),
    page.getByRole("button", { name: "Ask Island Travel Guide", exact: true }),
  ]) {
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("textbox", { name: "Ask about Sibale" })).toBeFocused();
    await page.getByRole("button", { name: "Close island guide" }).click();
    await expect(trigger).toBeFocused();
  }
});
