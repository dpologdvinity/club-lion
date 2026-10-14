/** Build-time helpers that turn a production bundle into an offline service worker. */

export type EmittedFile = { fileName: string; code?: string };

const PUBLIC_REF =
  /(?<![\w-])((?:assets|fonts|icons)\/[\w.-]+\.(?:png|webp|jpg|svg|woff2))/g;

/**
 * Every bundle file plus the public files the bundle references by path,
 * so the first online visit caches everything a later offline visit needs.
 */
export function collectPrecacheUrls(
  emitted: readonly EmittedFile[],
  publicFiles: ReadonlySet<string>,
  extras: readonly string[],
): string[] {
  const urls = new Set<string>(["./", ...extras]);
  for (const file of emitted) {
    if (file.fileName === "sw.js" || file.fileName.endsWith(".map")) continue;
    urls.add(file.fileName);
    if (!file.code) continue;
    for (const match of file.code.matchAll(PUBLIC_REF)) {
      if (publicFiles.has(match[1])) urls.add(match[1]);
    }
  }
  return [...urls].sort();
}

/** Short stable hash so each build gets its own cache and old ones are deleted. */
export function versionFor(urls: readonly string[]): string {
  let hash = 2166136261;
  for (const char of urls.join("|")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Network-first for pages (fresh game when online, cached game offline),
 * cache-first for everything else (hashed bundle files never change).
 */
export function renderServiceWorker(urls: readonly string[]): string {
  const cache = `club-lion-${versionFor(urls)}`;
  return `const CACHE = ${JSON.stringify(cache)};
const PRECACHE = ${JSON.stringify(urls)};
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("./", copy));
          return response;
        })
        .catch(() => caches.match("./")),
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
`;
}
