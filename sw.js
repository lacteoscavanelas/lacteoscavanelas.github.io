/* Guarda la app en el teléfono para que abra sin señal. Los datos van siempre al servidor (no se guardan acá). */
const VERSION = 'visitas-v5';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './politica.html',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;                       // las llamadas al servidor (POST) no se tocan
  if (u.origin === location.origin) {                   // la app: primero la red, si no hay, lo guardado
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSION).then(k => k.put(r, c)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {   // tipografías: lo guardado primero
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(VERSION).then(k => k.put(r, c)); return res; })));
  }
});
