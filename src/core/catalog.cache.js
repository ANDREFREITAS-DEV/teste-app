// src/core/catalog.cache.js
const KEY = "zapflow_catalog_cache_v1";

export function saveCatalog(data) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      updatedAt: Date.now(),
      data,
    })
  );
}

export function loadCatalog() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
