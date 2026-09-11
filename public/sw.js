const CACHE_NAME = "history-viewer-v3";

// Base directory so paths work both at the site root (dev) and
// under a sub-path (e.g. GitHub Pages project site).
const BASE = self.location.pathname.replace(/[^/]*$/, "");

const PRECACHE_URLS = [
  BASE,
  BASE + "manifest.json",
  BASE + "pwa/icon-192.png",
  BASE + "pwa/icon-512.png",
  BASE + "pwa/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // App shell navigation: network-first, fall back to cached base page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(BASE))
    );
    return;
  }

  // Let cross-origin requests (fonts, etc.) go through untouched.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Same-origin assets (/_next/*, /content/*, /pwa/*): stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});