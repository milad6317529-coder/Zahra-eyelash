const CACHE_NAME = 'mashe-zahra-v1';
const urlsToCache = [
  './',
  './index.html',
  './site.webmanifest'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Ignore errors if some files don't exist
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch (simple network-first for HTML, cache-first for assets)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((fetchResponse) => {
        // Cache static assets
        if (event.request.url.match(/\.(png|jpg|jpeg|svg|ico|css|js|webmanifest)$/)) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Offline fallback for HTML
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
