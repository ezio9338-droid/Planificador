/* Service worker de Rumbo PAU: permite usar la app sin conexión. */
var CACHE = 'rumbopau-v1';
var ARCHIVOS = [
  './',
  'index.html',
  'css/estilos.css',
  'js/catalogo.js',
  'js/planificador.js',
  'js/exportar.js',
  'js/app.js',
  'manifest.webmanifest',
  'img/icono.svg',
  'img/icono-192.png',
  'img/icono-512.png',
  'img/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (claves) {
    return Promise.all(claves.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Red primero (para recibir siempre la última versión) y caché si no hay conexión.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (resp) {
      if (resp.ok) {
        var copia = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      }
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); });
    })
  );
});
