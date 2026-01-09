/**
 * Service Worker для POS System
 * Обеспечивает офлайн-работу приложения
 */

const CACHE_NAME = 'pos-cache-v1';
const RUNTIME_CACHE = 'pos-runtime-v1';

// Ресурсы для кэширования при установке
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        console.log('[SW] Deleting old cache:', cacheToDelete);
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Стратегия кэширования: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') return;

  // Пропускаем запросы к внешним ресурсам (кроме шрифтов)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && !url.hostname.includes('fonts.')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Кэшируем успешные ответы
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // При ошибке сети возвращаем офлайн-страницу для навигации
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return null;
        });

      // Возвращаем кэш сразу, обновляя в фоне
      return cachedResponse || fetchPromise;
    })
  );
});

// Обработка push-уведомлений (для будущего)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'POS System';
  const options = {
    body: data.body || 'Новое уведомление',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Синхронизация в фоне (для будущего)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sales') {
    console.log('[SW] Background sync: sales');
    // Здесь можно добавить синхронизацию продаж с сервером
  }
});
