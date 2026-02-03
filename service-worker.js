// Версия кэша - обновлять при изменении файлов
const CACHE_NAME = 'hsk-assistant-v2.0';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/data-hsk1.js',
  '/data-hsk2.js',
  '/data-hsk3.js',
  '/data-hsk4.js',
  '/manifest.json',
  // Иконки для PWA
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  // Шрифты и библиотеки
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;500;700;900&family=ZCOOL+QingKe+HuangYou&family=ZCOOL+XiaoWei&display=swap'
];

// Установка Service Worker и кэширование файлов
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Установка...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Кэширование файлов...');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('[Service Worker] Файлы успешно закэшированы');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Ошибка при кэшировании:', error);
      })
  );
});

// Активация Service Worker и удаление старых кэшей
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Активация...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Активация завершена');
      return self.clients.claim();
    })
  );
});

// Стратегия кэширования: сначала кэш, потом сеть с обновлением кэша
self.addEventListener('fetch', (event) => {
  // Пропускаем POST запросы и запросы к сторонним ресурсам
  if (event.request.method !== 'GET') {
    return;
  }

  // Пропускаем запросы к API и динамическим данным
  if (event.request.url.includes('/api/') || event.request.url.includes('data:')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Если есть в кэше, возвращаем из кэша
        if (cachedResponse) {
          console.log('[Service Worker] Запрос из кэша:', event.request.url);
          return cachedResponse;
        }

        // Иначе делаем сетевой запрос
        return fetch(event.request)
          .then((networkResponse) => {
            // Проверяем валидность ответа
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Клонируем ответ для кэширования
            const responseToCache = networkResponse.clone();

            // Сохраняем в кэш
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('[Service Worker] Новый файл закэширован:', event.request.url);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] Ошибка при загрузке:', error);
            
            // Для HTML страниц возвращаем запасную страницу
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            return new Response('Офлайн режим: ресурс недоступен', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Фоновая синхронизация для сохранения прогресса
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    console.log('[Service Worker] Фоновая синхронизация прогресса...');
    event.waitUntil(syncProgress());
  }
});

// Периодическая синхронизация
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    console.log('[Service Worker] Периодическое обновление контента...');
    event.waitUntil(updateContent());
  }
});

// Сохранение прогресса в IndexedDB
async function syncProgress() {
  try {
    // Здесь можно добавить логику синхронизации с сервером
    console.log('[Service Worker] Синхронизация прогресса выполнена');
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Ошибка синхронизации:', error);
    return Promise.reject(error);
  }
}

// Обновление контента
async function updateContent() {
  try {
    // Проверяем обновления данных
    const cache = await caches.open(CACHE_NAME);
    const urlsToUpdate = CACHE_FILES.filter(url => !url.startsWith('http'));
    
    for (const url of urlsToUpdate) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('[Service Worker] Обновлен файл:', url);
        }
      } catch (error) {
        console.warn('[Service Worker] Не удалось обновить файл:', url, error);
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Ошибка обновления контента:', error);
    return Promise.reject(error);
  }
}

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Получено push-уведомление');
  
  const options = {
    body: event.data ? event.data.text() : 'Время повторить слова!',
    icon: 'icon-192x192.png',
    badge: 'icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть приложение'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('HSK Помощник', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Клик по уведомлению');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        // Если есть открытое окно, фокусируемся на нем
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Иначе открываем новое окно
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
