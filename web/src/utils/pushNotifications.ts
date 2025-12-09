// web/src/utils/pushNotifications.ts
import api from '../services/api';

/**
 * Запрашивает разрешение на push-уведомления и отправляет подписку на сервер
 */
export const registerPushNotifications = async (userToken: string) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return;
  }

  try {
    // Регистрация Service Worker (должен находиться в public/)
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // Запрос разрешения
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push permission denied');
      return;
    }

    // Получение подписки
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
    });

    // Отправка подписки на сервер
    await api.post('/push/subscribe', {
      endpoint: subscription.endpoint,
      keys: subscription.toJSON().keys,
    });

    console.log('Push subscription registered');
  } catch (error) {
    console.error('Failed to register push notifications:', error);
  }
};

/**
 * Вспомогательная функция для преобразования VAPID-ключа
 */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const urlB64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(urlB64 + padding);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}