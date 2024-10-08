const cacheName = "image-overlay-cache-v1";
const assetsToCache = [
    "./",
    "./index.html",
    "./script.js",
    "./manifest.json",
    "./style.css",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => cache.addAll(assetsToCache))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
