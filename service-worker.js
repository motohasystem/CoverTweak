const CACHE_NAME = "cover-tweak-cache-v20241201";
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

// activateイベントリスナーを登録
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        return cacheName !== CACHE_NAME;
                    })
                    .map((cacheName) => {
                        return caches.delete(cacheName);
                    })
            );
        })
    );
});
