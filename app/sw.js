/* Sokkar Stop : service worker (fonctionne hors ligne + reçoit les notifications) */
var CACHE = 'sokkar-stop-v17';
try { importScripts('config.js'); } catch (e) {}
var API = (self.SS_API || '').replace(/\/?$/, '/');
var SHELL = ['./', 'index.html', 'app.css', 'app.js', 'manifest.webmanifest', 'config.js', 'icons/icon-192.png', 'icons/icon-512.png', 'confidentialite.html', 'suppression-compte.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Pages et fichiers de l'appli : réseau d'abord (toujours à jour), cache si hors ligne. L'API n'est jamais mise en cache. */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.indexOf('/api/') !== -1) { return; }
  e.respondWith(
    new Promise(function (resolve) {
      var done = false;
      var timer = setTimeout(function () {
        caches.match(req).then(function (r) { if (r && !done) { done = true; resolve(r); } });
      }, 3000);
      fetch(req, { cache: "no-cache" }).then(function (res) {
        clearTimeout(timer);
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        if (!done) { done = true; resolve(res); }
      }).catch(function () {
        clearTimeout(timer);
        caches.match(req).then(function (r) { return r || caches.match('index.html'); }).then(function (r) { if (!done) { done = true; resolve(r || Response.error()); } });
      });
    })
  );
});

/* Notification : le serveur envoie un signal vide, puis on va chercher le texte. */
self.addEventListener('push', function (e) {
  e.waitUntil(
    self.registration.pushManager.getSubscription().then(function (sub) {
      var ep = sub ? sub.endpoint : '';
      return fetch(API + 'message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: ep })
      }).then(function (r) { return r.json(); });
    }).catch(function () {
      return { title: 'Sokkar Stop', body: 'Ouvre l’appli pour voir ta journée.', tag: 'ss-fallback' };
    }).then(function (m) {
      var rtl = /[؀-ۿ]/.test((m.title || '') + (m.body || ''));
      return self.registration.showNotification(m.title || 'Sokkar Stop', {
        body: m.body || '',
        tag: m.tag || 'ss',
        icon: 'icons/icon-192.png',
        badge: 'icons/icon-192.png',
        lang: rtl ? 'ar' : 'fr',
        dir: rtl ? 'rtl' : 'ltr',
        data: { url: './' }
      });
    })
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) { return list[i].focus(); }
      }
      return self.clients.openWindow('./');
    })
  );
});
