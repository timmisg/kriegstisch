/* Service Worker des Hains: legt alle Dateien beim ersten Start ab, danach läuft die App offline. */
const CACHE = 'hain-860988bd5dc3';
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
// Unterordner mit eigener App und eigenem Service Worker (z. B. hain/): nie aus diesem Cache bedienen.
const SISTERS = [];
const BASE = new URL(self.registration.scope).pathname;
function inSister(url) {
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return false;
  const rel = url.pathname.slice(BASE.length);
  return SISTERS.some((s) => rel === s.slice(0, -1) || rel.startsWith(s));
}

self.addEventListener('install', (event) => {
  // cache: 'reload' umgeht den HTTP-Cache, sonst landen beim Update womöglich noch die alten Dateien im neuen Cache
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('hain-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((list) => list.forEach((c) => { if (inSister(new URL(c.url)) && c.navigate) c.navigate(c.url).catch(() => {}); }))
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || inSister(url)) return;
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
