const CACHE_NAME = "zapflow-client-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./icon.png",
  "./supabaseClient.js",

  "./src/main.js",

  "./src/core/state.js",
  "./src/core/storage.js",
  "./src/core/dom.js",

  "./src/infra/tenant.repo.js",
  "./src/infra/store-config.repo.js",
  "./src/infra/products.repo.js",
  "./src/infra/optionals.repo.js",
  "./src/infra/orders.repo.js",

  "./src/domain/cart.service.js",
  "./src/domain/totals.service.js",
  "./src/domain/whatsapp.service.js",

  "./src/ui/store.ui.js",
  "./src/ui/menu.ui.js",
  "./src/ui/product-modal.ui.js",
  "./src/ui/cart.ui.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.includes("supabase.co")) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
