self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("fetch", () => {
  // não faz cache de nada
});
