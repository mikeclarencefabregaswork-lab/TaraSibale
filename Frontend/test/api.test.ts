import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { api } from "../src/api.ts";
import { getToasts, dismissToast } from '../src/toastStore.ts';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
  getToasts().forEach(item => dismissToast(item.id));
});

test("a rejected mutation exposes the server error instead of returning success", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: "Sign in required" }), {
      status: 401,
    });
  await assert.rejects(
    api("/api/bookings", { accommodationId: "stay-1" }),
    /Sign in required/,
  );
  assert.deepEqual(getToasts().map(item => ({ message: item.message, kind: item.kind })), [{ message: 'Sign in required', kind: 'error' }]);
});

test("successful mutations preserve the server response and use the session cookie", async () => {
  const saved = {
    id: "server-booking-id",
    totalAmount: 2400,
    status: "CONFIRMED",
  };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/api/bookings");
    assert.equal(options?.credentials, "same-origin");
    assert.equal(options?.method, "POST");
    assert.deepEqual(JSON.parse(String(options?.body)), {
      accommodationId: "stay-1",
    });
    return new Response(JSON.stringify(saved), { status: 201 });
  };
  assert.deepEqual(
    await api("/api/bookings", { accommodationId: "stay-1" }),
    saved,
  );
});

test("logout accepts a successful empty response", async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await api("/api/auth/logout", {}), undefined);
});

test("a non-JSON outage still produces a useful failure", async () => {
  globalThis.fetch = async () =>
    new Response("Service unavailable", { status: 503 });
  await assert.rejects(api("/api/catalog"), /Request failed \(503\)/);
});

test('private autosaves carry the initiating account identity alongside the session cookie', async () => {
  globalThis.fetch = async (_url, options) => {
    assert.equal(options?.credentials, 'same-origin');
    assert.equal(new Headers(options?.headers).get('X-TaraSibale-User-Id'), 'account-a');
    return new Response(JSON.stringify({status:'ok'}));
  };
  await api('/api/user-state', {documents: []}, 'PUT', 'account-a');
});
