const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/site/index.html',
  '/icon.png'
];

// Установка — кешируем файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Перехват запросов — сначала из кеша, потом сеть
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
