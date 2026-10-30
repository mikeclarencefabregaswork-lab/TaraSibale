import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      // Workspace discovery otherwise permits sibling database and backend files.
      allow: [
        fileURLToPath(new URL(".", import.meta.url)),
        fileURLToPath(new URL("../node_modules", import.meta.url)),
      ],
      // Retain Vite's secret-file denies alongside project-private directories.
      deny: [
        ".env", ".env.*", "*.{crt,pem,key,p12,pfx,cer,der}",
        ".npmrc", ".yarnrc.yml", "**/.git/**",
        "**/.local-postgres/**", "**/Backend/**", "**/.superpowers/**",
      ],
    },
    proxy: {
      "/api": process.env.API_PROXY_TARGET || "http://127.0.0.1:3001",
    },
  },
});
