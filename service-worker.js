
const CACHE_NAME = 'my-pocket-cache-v8'; // Version 8
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/ads.txt',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;700;800&display=swap'
];

// Install SW
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Listen for requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const url = event.request.url;

            // Strict exclusion for Ads & Analytics to prevent PWA blocking ads
            if (
                url.startsWith('http') && 
                !url.includes('generativelanguage') &&
                !url.includes('googlesyndication') && 
                !url.includes('doubleclick') && 
                !url.includes('google-analytics') &&
                !url.includes('pagead') &&
                !url.includes('g.doubleclick')
            ) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                     cache.put(event.request, responseToCache);
                  });
            }

            return response;
          }
        );
      })
    );
});

// Activate the SW
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});