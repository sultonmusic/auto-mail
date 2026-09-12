/* Auto Mail — oflayn qobiq. Faqat o'z fayllarimizni keshlaydi;
   Gmail API so'rovlari hech qachon keshlanmaydi. */
var CACHE = 'automail-v4';
var SHELL = [
  './',
  './index.html',
  './style.css',
  './store.js',
  './gmail.js',
  './app.js',
  './icon.svg',
  './logo.png',
  './i18n.js',
  './analyzer.js',
  './template.js',
  './manifest.webmanifest'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      /* {cache:'reload'} — brauzerning eski nusxasini o'tkazib yuborib,
         serverdan yangisini oladi. Aks holda o'rnatishda ham eskisi
         keshga tushib qolardi. */
      return cache.addAll(SHELL.map(function (path) {
        return new Request(path, { cache: 'reload' });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) { return key !== CACHE; })
        .map(function (key) { return caches.delete(key); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    /* 'no-cache' — har safar serverdan so'raladi, lekin fayl o'zgarmagan
       bo'lsa server 304 qaytaradi (trafik sarflanmaydi). Shu tufayli
       yangilangan kod darhol yetib keladi. */
    fetch(request, { cache: 'no-cache' }).then(function (response) {
      var copy = response.clone();
      caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
      return response;
    }).catch(function () {
      return caches.match(request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});

/* Bildirishnoma bosilganda ochiq oynani old planga chiqaramiz,
   ochiq bo'lmasa ilovani ochamiz. */
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = (event.notification.data && event.notification.data.url) || './';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windows) {
      for (var i = 0; i < windows.length; i++) {
        if (windows[i].url.indexOf(self.registration.scope) === 0 && 'focus' in windows[i]) {
          return windows[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
