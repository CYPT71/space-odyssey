// Minimal service worker placeholder to silence 404s and allow future offline features.
// Currently acts as a no-op pass-through.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through for now; modify to add caching if desired.
  event.respondWith(fetch(event.request));
});
