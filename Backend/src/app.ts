import express from "express";
import type { Pool } from "pg";
import { createApi } from "./api.js";

export function createApp(
  checkDatabase: () => Promise<void>,
  database?: Pool,
  options: { portfolioMode?: boolean } = {},
) {
  const app = express();
  app.disable("x-powered-by");

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/health/db", async (_request, response) => {
    try {
      await checkDatabase();
      response.json({ status: "ok", database: "connected" });
    } catch {
      response.status(503).json({ status: "error", database: "unavailable" });
    }
  });

  const portfolioMode = options.portfolioMode ?? process.env.PORTFOLIO_MODE !== "false";
  if (database) {
    if (portfolioMode) {
      app.use("/api", (request, response, next) => {
        const path = request.path.replace(/\/+$/, "");
        if (request.method === "GET" || request.method === "HEAD") {
          if (path === "/auth/me") { response.json(null); return; }
          if (path === "/reviews") { response.json([]); return; }
          if (path === "/catalog" || path === "/weather") { next(); return; }
        }
        response.status(403).json({
          error: "Portfolio demo: accounts, uploads, bookings and publishing are disabled. Please use sample data only.",
        });
      });
    }
    app.use("/api", createApi(database, { portfolioMode }));
  }

  app.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });

  return app;
}
