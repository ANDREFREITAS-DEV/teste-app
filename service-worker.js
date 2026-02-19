const CACHE_NAME = "zapflow-client-v3";

const APP_SHELL = [
  "/",
  "/index.html",
  "/offline.html",
  "/styles.css",
  "/manifest.json",
  "/icon.png",

  "/src/main.js",

  "/src/core/state.js",
  "/src/core/storage.js",
  "/src/core/dom.js",
  "/src/core/cart.store.js",
  "/src/core/catalog.cache.js",

  "/src/infra/tenant.repo.js",
  "/src/infra/store-config.repo.js",
  "/src/infra/products.repo.js",
  "/src/infra/optionals.repo.js",
  "/src/infra/orders.repo.js",

  "/src/domain/cart.service.js",
  "/src/domain/totals.service.js",
  "/src/domain/whatsapp.service.js",

  "/src/ui/store.ui.js",
  "/src/ui/menu.ui.js",
  "/src/ui/product-modal.ui.js",
  "/src/ui/cart.ui.js",
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // não cachear Supabase API
  if (event.request.url.includes("supabase.co")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 1) cache first
      if (cached) return cached;

      // 2) network fallback
      return fetch(event.request).catch(() => {
        // 3) fallback offline page
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
      });
    })
  );
});
