// ============================================================
// II COPA BABA DOS COROAS — Service Worker (funcionar offline)
// Estratégia:
//  - Imagens (cards, logos): cache-first (pesam e mudam pouco)
//  - HTML/JS/CSS/JSON: network-first (sempre fresco quando online,
//    cai no cache só quando estiver sem internet)
// Bump o CACHE ao mudar esta estratégia.
// ============================================================

const CACHE = 'copa-baba-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo-copa.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))).catch(() => {})
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // deixa CDN/Supabase irem direto à rede

  const ehImagem = /\.(png|jpe?g|svg|webp|gif|ico)$/i.test(url.pathname);

  if (ehImagem) {
    // cache-first
    e.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        }).catch(() => hit)
      )
    );
  } else {
    // network-first (html/js/css/json)
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() =>
        caches.match(req).then((hit) => hit || caches.match('./index.html'))
      )
    );
  }
});
