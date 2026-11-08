import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ToastViewport } from "../src/components/ToastViewport.tsx";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  toast,
  getToasts,
  dismissToast,
  subscribeToasts,
} from "../src/toastStore.ts";

afterEach(() => getToasts().forEach((item) => dismissToast(item.id)));

test("notifications are bounded and repeated live messages do not flood the queue", () => {
  toast.success("Saved");
  toast.success("Saved");
  assert.equal(getToasts().length, 1);
  toast.info("One");
  toast.info("Two");
  toast.error("Three");
  toast.info("Four");
  assert.equal(getToasts().length, 4);
  assert.equal(
    getToasts().some((item) => item.message === "Saved"),
    false,
  );
  assert.equal(
    getToasts().find((item) => item.message === "Three")?.kind,
    "error",
  );
});

test("dismissal removes only its notification and subscribers can unsubscribe", () => {
  let updates = 0;
  const unsubscribe = subscribeToasts(() => updates++);
  toast.success("First");
  toast.info("Second");
  const first = getToasts()[0].id;
  dismissToast(first);
  assert.deepEqual(
    getToasts().map((item) => item.message),
    ["Second"],
  );
  assert.equal(updates, 3);
  unsubscribe();
  toast.info("Third");
  assert.equal(updates, 3);
});

test("temporary notifications expose a dismissal countdown and manual close control", () => {
  toast.info("Sample update");
  const html = renderToStaticMarkup(React.createElement(ToastViewport));
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-label="Time until notification closes"/);
  assert.match(html, /aria-valuenow="6"/);
  assert.match(html, /aria-label="Dismiss notification"/);
  assert.match(html, /Sample update/);
});
