import assert from "node:assert/strict";
import { test } from "node:test";

test("tag-entry Enter accepts direct input and preserves IME candidate confirmation", async () => {
  const { isSubmitKey } = await import("../src/keyboard.ts");
  assert.equal(isSubmitKey({ key: "Enter", isComposing: false, keyCode: 13 }), true);
  assert.equal(isSubmitKey({ key: "Enter", isComposing: true, keyCode: 13 }), false);
  assert.equal(isSubmitKey({ key: "Enter", isComposing: false, keyCode: 229 }), false);
  assert.equal(isSubmitKey({ key: "a", isComposing: false, keyCode: 65 }), false);
});
