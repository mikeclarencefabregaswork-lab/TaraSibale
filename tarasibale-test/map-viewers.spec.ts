import { expect, test } from "@playwright/test";

test("Google satellite opens first and the interactive map retains its tools and state", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  // Exercise our viewer controls independently of Google's network availability.
  await page.route("https://www.google.com/maps/embed?*", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Satellite viewer</p>" }),
  );
  await page.goto("/#map");
  await expect(page).toHaveTitle("Map | TaraSibale");
  const google = page.getByRole("button", { name: "Google Satellite", exact: true });
  const interactive = page.getByRole("button", { name: "Trails & Places", exact: true });
  await expect(google).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(google).toHaveAttribute("aria-pressed", "true");
  const frame = page.getByTitle("Google satellite map of Concepcion National High School", { exact: true });
  await expect(frame).toBeVisible();
  const src = new URL((await frame.getAttribute("src"))!);
  expect(src.origin).toBe("https://www.google.com");
  expect(src.pathname).toBe("/maps/embed");
  expect(src.searchParams.get("pb")).toContain("!2d121.71623!3d12.90905");
  expect(src.searchParams.get("pb")).toContain("!5e1!");
  await expect(page.getByRole("link", { name: "Open in Google Maps", exact: true })).toHaveAttribute("target", "_blank");
  await expect(page.getByPlaceholder("Search map places...")).toBeHidden();
  const box = (await frame.boundingBox())!;
  expect(box.width).toBeGreaterThan(250);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);

  await interactive.click();
  await expect(interactive).toHaveAttribute("aria-pressed", "true");
  await expect(frame).toBeHidden();
  const search = page.getByPlaceholder("Search map places...");
  await search.fill("Guiwanon");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.getByRole("button", { name: "Zoom in", exact: true })).toBeVisible();
  await page.getByTitle("Open Terrain Layer Controls & Feature Toggles").click();
  await expect(page.getByText("Map View & Layer Control", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close layers panel", exact: true }).click();
  await google.click();
  await expect(frame).toBeVisible();
  await interactive.click();
  await expect(search).toHaveValue("Guiwanon");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  expect(errors).toEqual([]);
});

test("the Google viewer explains offline availability and recovers when online", async ({ page, context }) => {
  await page.route("https://www.google.com/maps/embed?*", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Satellite viewer</p>" }),
  );
  await page.goto("/#map");
  const frame = page.getByTitle("Google satellite map of Concepcion National High School", { exact: true });
  await expect(frame).toBeVisible();
  await context.setOffline(true);
  await expect(page.getByText("Google Satellite needs an internet connection.", { exact: false })).toBeVisible();
  await expect(frame).toHaveCount(0);
  await context.setOffline(false);
  await expect(frame).toBeVisible();
});
