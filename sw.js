/* Service Worker des Kriegstischs: legt alle Dateien beim ersten Start ab, danach läuft die App offline. */
const CACHE = 'kriegstisch-90e04dfba908';
const ASSETS = [
  "./",
  "fonts/OFL-BarlowCondensed.txt",
  "fonts/OFL-BarlowSemiCondensed.txt",
  "fonts/OFL-Literata.txt",
  "fonts/barlow-condensed-latin-500-normal.woff2",
  "fonts/barlow-condensed-latin-600-normal.woff2",
  "fonts/barlow-condensed-latin-700-normal.woff2",
  "fonts/barlow-condensed-latin-ext-500-normal.woff2",
  "fonts/barlow-condensed-latin-ext-600-normal.woff2",
  "fonts/barlow-condensed-latin-ext-700-normal.woff2",
  "fonts/barlow-condensed-vietnamese-500-normal.woff2",
  "fonts/barlow-condensed-vietnamese-600-normal.woff2",
  "fonts/barlow-condensed-vietnamese-700-normal.woff2",
  "fonts/barlow-semi-condensed-latin-500-normal.woff2",
  "fonts/barlow-semi-condensed-latin-600-normal.woff2",
  "fonts/barlow-semi-condensed-latin-700-normal.woff2",
  "fonts/barlow-semi-condensed-latin-ext-500-normal.woff2",
  "fonts/barlow-semi-condensed-latin-ext-600-normal.woff2",
  "fonts/barlow-semi-condensed-latin-ext-700-normal.woff2",
  "fonts/barlow-semi-condensed-vietnamese-500-normal.woff2",
  "fonts/barlow-semi-condensed-vietnamese-600-normal.woff2",
  "fonts/barlow-semi-condensed-vietnamese-700-normal.woff2",
  "fonts/fonts.css",
  "fonts/literata-latin-ext-opsz-italic.woff2",
  "fonts/literata-latin-ext-opsz-normal.woff2",
  "fonts/literata-latin-opsz-italic.woff2",
  "fonts/literata-latin-opsz-normal.woff2",
  "fonts/literata-vietnamese-opsz-italic.woff2",
  "fonts/literata-vietnamese-opsz-normal.woff2",
  "icons/apple-touch-icon.png",
  "icons/icon-1024.png",
  "icons/icon-120.png",
  "icons/icon-152.png",
  "icons/icon-167.png",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-32.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "index.html",
  "manifest.webmanifest"
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('kriegstisch-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then((cache) => cache.match('index.html')).then((hit) => hit || fetch(req)));
    return;
  }
  event.respondWith(
    caches.open(CACHE).then((cache) => cache.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    })))
  );
});
