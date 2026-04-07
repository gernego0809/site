const CACHE_NAME = 'pwa-cache-v1';

// НЕ кешируем конкретные URL, а перехватываем все запросы
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если нашли в кеше - отдаём
        if (response) {
          return response;
        }
        
        // Если нет - идём в сеть и сохраняем в кеш
        return fetch(event.request).then(networkResponse => {
          // Кешируем только успешные GET-запросы
          if (event.request.method === 'GET' && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Офлайн-режим: показать страницу-заглушку
        return caches.match('/offline.html');
      })
  );
});
