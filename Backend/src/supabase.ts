import { createServer } from "node:http";
import { createApp } from "./app.js";
import { checkDatabase, pool } from "./db.js";

export function startSupabaseApi(options: { appOrigin: string; portfolioMode?: boolean }) {
  const app = createApp(checkDatabase, pool, { ...options, secureCookies: true });

  return createServer((request, response) => {
    // The gateway can include its routing prefix. Express owns the /api routes.
    request.url = request.url?.replace(/^\/functions\/v1(?=\/api(?:[/?]|$))/, "");
    app(request, response);
  }).listen(8000);
}
