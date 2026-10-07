const CACHE = 'wat-eten-we-v1';
const FILES = ['./', 'index.html', 'style.css', 'world.js', 'world-dishes.js', 'icons.js', 'map.js', 'recipes.js', 'app.js', 'countries-50m.json', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
// Zo lang (in milliseconden) krijgt het netwerk de tijd voordat de bewaarde versie wordt gebruikt.
const PATIENCE = 4000;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Eerst het netwerk, zodat je altijd de nieuwste versie krijgt. Zonder internet komt de app uit de cache, en
// ook als het antwoord te lang op zich laat wachten (slecht bereik, bijvoorbeeld in de supermarkt). Wat
// daarna toch nog binnenkomt, wordt bewaard voor de volgende keer.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  let stored = Promise.resolve();
  const fresh = fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      stored = caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
    }
    return response;
  });
  const saved = () => caches.match(event.request, { ignoreSearch: true });
  const slow = new Promise(resolve => setTimeout(resolve, PATIENCE, 'slow'));
  event.respondWith(
    Promise.race([fresh, slow])
      .then(result => result === 'slow' ? saved().then(hit => hit || fresh) : result)
      .catch(() => saved())
  );
  // Ook na een antwoord uit de cache mag het netwerk zijn werk afmaken.
  event.waitUntil(fresh.then(() => stored, () => {}));
});
