// Офлайн-режим приложения-трекера: сначала сеть, без сети — последняя сохранённая версия.
// Запросы к другим сайтам (Firebase) не перехватываются. Каждый запрос сверяется с сервером (cache: no-cache),
// чтобы после публикации сразу открывалась новая версия, а не копия из HTTP-кэша браузера.
const CACHE = 'health-app-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', '../icon-180.png', '../icon-192.png', '../icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('health-app-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
