import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { createServer } from "vite";

test("Vite serves the frontend but denies sibling database and backend files", async () => {
  const frontend = fileURLToPath(new URL("../", import.meta.url));
  const probe = fileURLToPath(
    new URL(
      `../../.local-postgres/vite-probe-${randomUUID()}.txt`,
      import.meta.url,
    ),
  );
  await mkdir(
    fileURLToPath(new URL("../../.local-postgres/", import.meta.url)),
    { recursive: true },
  );
  await writeFile(probe, "Harmless filesystem isolation regression probe.");
  // A test server must not invalidate the running app's optimized dependencies.
  const cacheDir = await mkdtemp(join(tmpdir(), "tarasibale-vite-test-"));
  const server = await createServer({
    root: frontend,
    cacheDir,
    configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
    server: {
      host: "127.0.0.1",
      port: 0,
      strictPort: false,
      hmr: false,
      watch: { ignored: ["**/*"] },
    },
    logLevel: "silent",
  });
  try {
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}`;
    assert.equal((await fetch(base + "/")).status, 200);
    const privateResponse = await fetch(base + "/@fs" + probe);
    assert.equal(
      privateResponse.status,
      403,
      "Project-local database files must not be served",
    );
    const backend = fileURLToPath(
      new URL("../../Backend/src/db.ts", import.meta.url),
    );
    assert.equal((await fetch(base + "/@fs" + backend)).status, 403);
    assert.equal((await fetch(base + "/src/main.tsx")).status, 200);
  } finally {
    await server.close();
    await rm(cacheDir, { recursive: true, force: true });
    await unlink(probe);
  }
});
