import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  collectPrecacheUrls,
  renderServiceWorker,
} from "./src/pwa/precache.ts";

function listPublicFiles(dir: string, root = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? listPublicFiles(path, root)
      : [relative(root, path).split("\\").join("/")];
  });
}

/** Emits sw.js at build time with every file the game needs offline. */
function offlineServiceWorker(): Plugin {
  return {
    name: "club-lion-offline-service-worker",
    apply: "build",
    generateBundle(_options, bundle) {
      const emitted = Object.values(bundle).map((file) => ({
        fileName: file.fileName,
        code:
          file.type === "chunk"
            ? file.code
            : typeof file.source === "string"
              ? file.source
              : undefined,
      }));
      const urls = collectPrecacheUrls(
        emitted,
        new Set(listPublicFiles("public")),
        [
          "manifest.webmanifest",
          "favicon.svg",
          "icons/icon-192.png",
          "icons/icon-512.png",
          "icons/icon-maskable-512.png",
          "icons/apple-touch-icon.png",
          // The pixel doll builds sprite paths at runtime, so list them all.
          ...listPublicFiles("public").filter((path) =>
            path.startsWith("assets/pixel/"),
          ),
        ],
      );
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: renderServiceWorker(urls),
      });
    },
  };
}

export default defineConfig({
  // GitHub Pages serves the game from /<repo>/; local dev and tests use "/".
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), offlineServiceWorker()],
  server: { host: "0.0.0.0", port: 5173 },
});
