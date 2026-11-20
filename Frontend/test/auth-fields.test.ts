import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("full-mode account forms expose associated labels, autofill and named password controls", async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), "tarasibale-form-test-"));
  const server = await createServer({ root: process.cwd(), configFile: false,
    cacheDir,
    server: { middlewareMode: true, hmr: false },
    define: { "import.meta.env.VITE_PORTFOLIO_MODE": '"false"' },
  });
  try {
    for (const component of ["AuthModal", "AuthPage"]) {
      const module = await server.ssrLoadModule(`/src/components/${component}.tsx`);
      for (const initialMode of ["login", "signup"]) {
        const html = renderToStaticMarkup(React.createElement(module[component], {
          isOpen: true, initialMode, isDarkMode: false, currentUser: null,
          onClose() {}, onLoginSuccess() {}, onLogout() {}, setActiveTab() {},
        }));
        const fields = [...html.matchAll(/<input\b[^>]*value=""[^>]*>/g)].map(match => match[0]);
        assert.ok(fields.length >= 2, `${component} ${initialMode} renders its real fields`);
        for (const input of fields) {
          const id = /\bid="([^"]+)"/.exec(input)?.[1];
          assert.ok(id, `${component} ${initialMode} field needs an id`);
          assert.ok(html.includes(`for="${id}"`), `${id} needs an associated label`);
          assert.match(input, /autoComplete="(?:name|username|email|current-password|new-password)"/i);
        }
        if (initialMode === "login") {
          assert.match(html, /<button[^>]*aria-label="Show password"[^>]*aria-pressed="false"/);
        }
      }
    }
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
