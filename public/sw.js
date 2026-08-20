const CACHE_NAME = "ml-mobile-shell-v1";
const SHELL_URLS = ["/mobile", "/manifest.json"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (!url.pathname.startsWith("/mobile") && url.pathname !== "/manifest.json") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached ?? fetch(event.request)),
  );
});
