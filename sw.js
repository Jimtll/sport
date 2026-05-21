// Service Worker — network-first strategy
// Garantit que l'utilisateur voit toujours la dernière version dès qu'il est en ligne
// VERSION 14 — emergency: aggressive overlay cleanup at init + ?reset=1 URL
const CACHE_NAME = 'sportduo-cache-v14';
const NETWORK_TIMEOUT = 4000;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.map(n => n !== CACHE_NAME ? caches.delete(n) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Ne pas intercepter les requêtes non-GET (API GitHub PATCH, etc.)
  if (e.request.method !== 'GET') return;

  // Ne pas intercepter les requêtes vers GitHub API (sync Gist) ni CDN externes
  const url = new URL(e.request.url);
  if (url.hostname.includes('api.github.com') ||
      url.hostname.includes('raw.githubusercontent.com') ||
      url.hostname.includes('cdn.jsdelivr.net') ||
      url.hostname.includes('unpkg.com')) {
    return; // laisse le navigateur gérer
  }

  // Network-first : on essaie d'abord le réseau, sinon le cache
  e.respondWith(
    Promise.race([
      fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT))
    ]).catch(() => caches.match(e.request))
  );
});

// Message du client pour forcer un refresh manuel
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
