const CACHE_NAME = 'pwa-cache-v1';

// Установка Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker установлен');
    self.skipWaiting(); // Сразу активируем
});

// Активация
self.addEventListener('activate', event => {
    console.log('Service Worker активирован');
    event.waitUntil(clients.claim()); // Захватываем контроль
});

// Обработка сообщений от страницы
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: event.data.icon || '/icon.png',
            badge: event.data.badge || '/icon.png',
            vibrate: [200, 100, 200], // Вибрация на телефоне
            tag: 'simple-pwa-notification', // Группировка уведомлений
            data: {
                url: '/'
            }
        });
    }
});

// Обработка push-событий (от сервера)
self.addEventListener('push', event => {
    let data = {
        title: 'Новое уведомление',
        body: 'У вас новое сообщение',
        icon: '/icon.png',
        badge: '/icon.png'
    };
    
    // Парсим данные из push-сообщения
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            vibrate: [200, 100, 200],
            tag: data.tag || 'push-notification',
            data: {
                url: data.url || '/'
            }
        })
    );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    // Открываем приложение при клике
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Если уже есть открытое окно, фокусируем его
                for (let client of windowClients) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Иначе открываем новое
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url || '/');
                }
            })
    );
});

// Кеширование запросов (как в прошлый раз)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(networkResponse => {
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
                return new Response('Вы офлайн, но уведомления работают!', {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
    );
});
