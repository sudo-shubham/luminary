// Luminary Service Worker — Enables Android PWA installation & offline app-shell caching
const CACHE_NAME = 'luminary-v6';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './luminary-icon-48x48.png',
  './luminary-icon-192x192.png',
  './luminary-icon-maskable-192x192.png',
  './luminary-icon-512x512.png',
  './luminary-icon-maskable-512x512.png'
];

// Install: pre-cache core app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const BYPASS_HOSTS = [
  'api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'api.bigdatacloud.net',
  'nominatim.openstreetmap.org',
  'overpass-api.de',
  'en.wikipedia.org',
  'commons.wikimedia.org',
  'upload.wikimedia.org',
  'tile.openstreetmap.org'
];

// Fetch: network-first for local assets, falling back to cache when offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass live weather, geocoding, and scenic spots APIs from caching
  if (BYPASS_HOSTS.includes(url.hostname)) {
    return;
  }

  // Only handle local origin requests (fully local, no CDNs)
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));
    })
  );
});
