import assert from "node:assert/strict";
import { test } from "node:test";
import { pageSlideDirection } from "../src/navigation.ts";

test("page slide direction follows primary tab order in both directions", () => {
  assert.equal(pageSlideDirection("explore", "map"), 1);
  assert.equal(pageSlideDirection("map", "explore"), -1);
  assert.equal(pageSlideDirection("guide", "group"), 1);
  assert.equal(pageSlideDirection("group", "guide"), -1);
});

test("same-page navigation and unknown pages have no directional motion", () => {
  assert.equal(pageSlideDirection("explore", "explore"), 0);
  assert.equal(pageSlideDirection("missing", "map"), 0);
  assert.equal(pageSlideDirection("map", "missing"), 0);
});
