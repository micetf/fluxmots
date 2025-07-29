// Service Worker pour FluxMots

const CACHE_NAME = "fluxmots-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/manifest.json",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Activation du Service Worker
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interception des requêtes
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retourner la ressource du cache si elle existe
            if (response) {
                return response;
            }

            // Sinon, faire la requête réseau
            return fetch(event.request);
        })
    );
});
