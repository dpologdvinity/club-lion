import test from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import {
  collectPrecacheUrls,
  renderServiceWorker,
  versionFor,
} from "./precache.ts";

const PUBLIC = new Set([
  "fonts/nunito.woff2",
  "assets/savanna.webp",
  "assets/lion-chibi-living-cub.png",
  "assets/unused-sheet.jpg",
  "icons/icon-192.png",
]);

test("precache keeps bundle files and only the public files they reference", () => {
  const urls = collectPrecacheUrls(
    [
      {
        fileName: "index.html",
        code: '<link rel="icon" href="/icons/icon-192.png">',
      },
      {
        fileName: "assets/index-abc123.css",
        code: 'url("/fonts/nunito.woff2") url(/assets/savanna.webp)',
      },
      {
        fileName: "assets/index-def456.js",
        code: '`${base}assets/lion-chibi-living-cub.png` "assets/missing.png"',
      },
      { fileName: "assets/index-def456.js.map" },
      { fileName: "sw.js", code: "" },
    ],
    PUBLIC,
    ["manifest.webmanifest"],
  );
  assert.deepEqual(urls, [
    "./",
    "assets/index-abc123.css",
    "assets/index-def456.js",
    "assets/lion-chibi-living-cub.png",
    "assets/savanna.webp",
    "fonts/nunito.woff2",
    "icons/icon-192.png",
    "index.html",
    "manifest.webmanifest",
  ]);
});

test("cache version changes when the file list changes and is stable otherwise", () => {
  assert.equal(versionFor(["a.js", "b.css"]), versionFor(["a.js", "b.css"]));
  assert.notEqual(versionFor(["a.js"]), versionFor(["a2.js"]));
});

test("the service worker embeds the precache list under a versioned cache", () => {
  const source = renderServiceWorker(["./", "assets/index-abc.js"]);
  assert.match(source, /const PRECACHE = \["\.\/","assets\/index-abc\.js"\];/);
  assert.match(source, /const CACHE = "club-lion-[0-9a-z]+";/);
  // Compile only, never run: proves the generated worker is valid JavaScript.
  assert.doesNotThrow(() => new Script(source));
});
