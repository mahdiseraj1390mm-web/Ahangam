// Service Worker uninstaller to ensure real-time dynamic fresh content on mobile & desktop
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    })
  );
  self.clients.claim();
});

// Network-only fetch pass-through (never cache old versions)
self.addEventListener('fetch', (event) => {
  // Pass-through to network directly
  return;
});
