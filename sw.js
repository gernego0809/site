self.addEventListener('install', (event) => {
  console.log('Service Worker установлен');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker активирован');
  event.waitUntil(clients.claim());
});

// Обработка push-уведомлений с сервера
self.addEventListener('push', (event) => {
  console.log('Получено push-сообщение:', event);
  
  let data = {
    title: 'Новое уведомление',
    body: 'У вас новое сообщение!',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };
  
  if (event.data) {
    try {
      const parsedData = event.data.json();
      data = { ...data, ...parsedData };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: {
      url: self.location.origin
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('Клик по уведомлению');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: event.data.icon,
      badge: event.data.badge,
      vibrate: [200, 100, 200]
    });
  }
});
