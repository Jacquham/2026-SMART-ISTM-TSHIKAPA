// Service worker SMART-ISTM-T'PA : installation sur l'écran d'accueil et secours hors ligne.
// Seuls les fichiers de l'application sont mis en mémoire. Les échanges avec la base
// (autre adresse que celle du site) ne passent jamais par ici.
const CACHE = 'smart-istm-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(self.registration.scope))
      .catch(() => {}),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const requete = event.request;
  if (requete.method !== 'GET') return;
  if (new URL(requete.url).origin !== self.location.origin) return;

  // Réseau d'abord (toujours la dernière version), mémoire en secours.
  event.respondWith(
    fetch(requete)
      .then((reponse) => {
        if (reponse.ok) {
          const copie = reponse.clone();
          caches.open(CACHE).then((cache) => cache.put(requete, copie));
        }
        return reponse;
      })
      .catch(() => caches.match(requete).then((r) => r || caches.match(self.registration.scope))),
  );
});
