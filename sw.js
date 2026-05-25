self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', event => {
    let data = { title: 'Новое уведомление', body: 'Сообщение от PWA', icon: '/icons/icon-192.png' };
    if (event.data) {
        try {
            data = event.data.json();
        } catch(e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200],
        data: { url: data.url || '/' }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Демо-отправка из клиента (только для теста, без реального сервера)
self.addEventListener('message', event => {
    if (event.data.type === 'TEST_PUSH') {
        self.registration.showNotification('Тест PWA', {
            body: 'Это тестовое уведомление от вашего PWA!',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png'
        });
    }
});
