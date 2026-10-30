import express from "express";
import type { Pool } from "pg";
import { createApi } from "./api.js";

export function createApp(checkDatabase: () => Promise<void>, database?: Pool) {
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

  if (database) app.use("/api", createApi(database));

  app.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });

  return app;
}
