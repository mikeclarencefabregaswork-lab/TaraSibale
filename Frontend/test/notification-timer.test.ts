import assert from "node:assert/strict";
import { test } from "node:test";
import { NotificationTimer } from "../src/notificationTimer.ts";

test("notification countdown resumes the remaining time instead of restarting", () => {
  const timer = new NotificationTimer(5500);
  timer.resume(1000);
  assert.equal(timer.remaining(3000), 3500);
  timer.pause(3000);
  assert.equal(timer.remaining(9000), 3500);
  timer.resume(9000);
  assert.equal(timer.remaining(10000), 2500);
  assert.equal(timer.remaining(12500), 0);
  assert.equal(timer.remaining(13000), 0);
});

test("repeated pause and resume events do not change the deadline", () => {
  const timer = new NotificationTimer(9000);
  timer.resume(0);
  timer.resume(1000);
  timer.pause(2000);
  timer.pause(3000);
  timer.resume(5000);
  assert.equal(timer.remaining(6000), 6000);
});
