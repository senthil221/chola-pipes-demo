const CACHE = "chola-b01ef8d6ea5c";
// Paths are relative to the service worker scope, so the app works at the
// domain root or under a sub-path (e.g. a GitHub Pages project site).
const PRECACHE = ["","manifest.webmanifest","brand/logo.png","brand/logo-white.png","brand/mark-white.png","icons/icon-192.png","icons/icon-512.png","_next/static/chunks/0cz1d0mv5g_q7.js","_next/static/chunks/0j1we3cwg31qe.js","_next/static/chunks/0xqsvia_0kb8y.js","_next/static/chunks/24cgbjlrdzcfu.css","_next/static/chunks/2idppak_l1im-.js","_next/static/chunks/39_j1bdzreq0m.js","_next/static/chunks/3qfy96eoyh-ek.js","_next/static/chunks/turbopack-30z42fk9t5bel.js","_next/static/Y4Zoruu7vonxPCJ858Xww/_buildManifest.js","_next/static/Y4Zoruu7vonxPCJ858Xww/_clientMiddlewareManifest.js","_next/static/Y4Zoruu7vonxPCJ858Xww/_ssgManifest.js","fonts/font-1.ttf","fonts/font-2.ttf","fonts/font-3.ttf","fonts/font-4.ttf","fonts/font-5.ttf","fonts/font-6.ttf","fonts/font-7.ttf","fonts/font-8.ttf","fonts/font-9.ttf","fonts/fonts.css"];
const BASE = new URL(self.registration.scope).pathname;
const SHELL = BASE;
const STATIC = ["_next/static/", "icons/", "fonts/", "brand/"].map(
  (p) => BASE + p,
);
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((p) => BASE + p))),
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(BASE) ||
    url.pathname.startsWith(BASE + "auth") ||
    url.search
  )
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((c) => c.put(SHELL, copy));
          }
          return response;
        })
        .catch(() => caches.match(SHELL)),
    );
    return;
  }
  if (STATIC.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(
      caches.match(event.request).then(
        (hit) =>
          hit ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((c) => c.put(event.request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
