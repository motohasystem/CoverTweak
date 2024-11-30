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

// activateイベントリスナーを登録
self.addEventListener("activate", (event) => {
    // 古いキャッシュを削除するための非同期処理を待つ
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            // すべてのキャッシュ名を取得し、Promise.allで非同期削除を実行
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 現在のキャッシュ名と異なる場合は削除
                    if (cacheName !== currentCacheName) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
