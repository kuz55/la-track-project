// web/public/sw.js
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'Новое уведомление';
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      tag: data.tag,
      data: data.data,
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Можно добавить логику перехода по клику
  // event.waitUntil(clients.openWindow('/coordinator'));
});