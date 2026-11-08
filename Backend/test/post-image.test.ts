import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { post } from "../src/validation.js";

const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVYkAAAAASUVORK5CYII=";
const draft = { caption: "An island moment", location: "Sibale" };

test("community posts accept a small uploaded raster image and caption-only posts", () => {
  assert.equal(post.safeParse({ ...draft, image: png }).success, true);
  assert.deepEqual(post.parse(draft), draft);
});

test("existing HTTP image posts remain supported", () => {
  assert.equal(post.safeParse({ ...draft, image: "https://example.test/photo.jpg" }).success, true);
  assert.equal(post.safeParse({ ...draft, image: "/assets/photo-unavailable.svg" }).success, true);
});

test("post attachments reject active formats, MIME mismatches and malformed base64", () => {
  for (const image of [
    "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
    "data:text/html;base64,PHNjcmlwdD4=",
    png.replace("image/png", "image/jpeg"),
    "data:image/png;base64,SGVsbG8=",
    "data:image/png;base64,A",
    png + "!", "javascript:alert(1)", "blob:some-browser-id", "",
  ]) assert.equal(post.safeParse({ ...draft, image }).success, false, image.slice(0, 50));
});

test("uploaded images enforce a one-MiB decoded byte limit", () => {
  const bytes = Buffer.alloc(1024 * 1024 + 1);
  Buffer.from(png.split(",")[1]!, "base64").copy(bytes);
  assert.equal(post.safeParse({ ...draft, image: `data:image/png;base64,${bytes.toString("base64")}` }).success, false);
});

test("a real JPEG passes attachment validation", async () => {
  const bytes = await readFile(new URL("../../Frontend/public/assets/food/leche-flan.jpg", import.meta.url));
  assert.equal(post.safeParse({ ...draft, image: `data:image/jpeg;base64,${bytes.toString("base64")}` }).success, true);
});
