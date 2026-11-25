// Service Worker: Purge stale caches and self-unregister to ensure live code delivery
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Always bypass cache and fetch directly from network
self.addEventListener('fetch', (event) => {
  // Let browser handle requests normally without intercepting or caching HTML/chunks
  return;
});
