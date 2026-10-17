/* ============================================================
   FUZZ — service-worker.js
   PWA Service Worker
   - Static cache (CSS, JS, ikonkalar, logo, sound)
   - Cache-first (assets) + Network-first (HTML)
   - Offline fallback
   - Version boshqaruvi
   ============================================================ */

const VERSION        = "fuzz-v1.0.0";
const STATIC_CACHE   = `${VERSION}-static`;
const RUNTIME_CACHE  = `${VERSION}-runtime`;
const IMAGE_CACHE    = `${VERSION}-images`;

/* ---------- Cache'lanadigan static fayllar ---------- */
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./store.html",
    "./library.html",
    "./wishlist.html",
    "./404.html",
    "./manifest.json",

    // CSS
    "./css/global.css",
    "./css/splash.css",
    "./css/urlbar.css",
    "./css/navbar.css",
    "./css/store.css",
    "./css/footer.css",
    "./css/auth.css",
    "./css/toast.css",

    // JS
    "./js/lang.js",
    "./js/toast.js",
    "./js/urlbar.js",
    "./js/store.js",
    "./js/main.js",
    "./js/auth.js",
    "./js/qr-login.js",
    "./js/cart.js",
    "./js/pwa.js",

    // Images
    "./image/logo.png",
    "./image/update.png",

    // Sound
    "./sound/notification.mp3",

    // Data
    "./data/games.json",

    // Icons (CDN — ixtiyoriy, offline uchun foydali emas, lekin xato bermasligi uchun)
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
];

/* ---------- Offline fallback sahifa ---------- */
const OFFLINE_URL = "./404.html";


/* ==========================================================
   1. INSTALL
   ========================================================== */
self.addEventListener("install", (event) => {
    console.info("[SW] Install:", VERSION);

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                // Har bir asset'ni alohida qo'shamiz — biri xato bersa, qolganlari davom etadi
                return Promise.all(
                    STATIC_ASSETS.map((url) =>
                        cache.add(url).catch((err) => {
                            console.warn("[SW] Cache xatosi:", url, err.message);
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});


/* ==========================================================
   2. ACTIVATE — eski cache'larni tozalash
   ========================================================== */
self.addEventListener("activate", (event) => {
    console.info("[SW] Activate:", VERSION);

    const validCaches = [STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE];

    event.waitUntil(
        caches.keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => !validCaches.includes(key))
                        .map((key) => {
                            console.info("[SW] Eski cache o'chirildi:", key);
                            return caches.delete(key);
                        })
                )
            )
            .then(() => self.clients.claim())
    );
});


/* ==========================================================
   3. FETCH — so'rovlarni boshqarish
   ========================================================== */
self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Faqat GET so'rovlari
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Chrome extension va boshqa protokollarni o'tkazib yuborish
    if (!url.protocol.startsWith("http")) return;

    // ---------- HTML sahifalar → Network-first ----------
    if (request.mode === "navigate" ||
        request.destination === "document") {
        event.respondWith(networkFirstHTML(request));
        return;
    }

    // ---------- Rasmlar → Stale-while-revalidate ----------
    if (request.destination === "image") {
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
        return;
    }

    // ---------- CSS, JS, fontlar → Cache-first ----------
    if (request.destination === "style"  ||
        request.destination === "script" ||
        request.destination === "font") {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // ---------- Audio, JSON va boshqalar → Stale-while-revalidate ----------
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});


/* ==========================================================
   4. STRATEGIYALAR
   ========================================================== */

/* ---------- Cache-first ---------- */
async function cacheFirst(request, cacheName) {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        // Offline — cache'dan qayta urinish
        return cached || Response.error();
    }
}

/* ---------- Network-first (HTML) ---------- */
async function networkFirstHTML(request) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        const cache  = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;

        // Offline fallback
        const fallback = await cache.match(OFFLINE_URL);
        if (fallback) return fallback;

        return new Response(
            "<h1>Offline</h1><p>Internet aloqasi yo'q.</p>",
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
    }
}

/* ---------- Stale-while-revalidate ---------- */
async function staleWhileRevalidate(request, cacheName) {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || fetchPromise;
}


/* ==========================================================
   5. MESSAGE — sahifadan xabar qabul qilish
   ========================================================== */
self.addEventListener("message", (event) => {
    const data = event.data || {};

    if (data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }

    if (data.type === "CLEAR_CACHE") {
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => caches.delete(k)))
        ).then(() => {
            event.source?.postMessage({ type: "CACHE_CLEARED" });
        });
    }

    if (data.type === "VERSION") {
        event.source?.postMessage({ type: "VERSION", version: VERSION });
    }
});


/* ==========================================================
   6. PUSH NOTIFICATIONS (kelajak uchun)
   ========================================================== */
self.addEventListener("push", (event) => {
    let payload = { title: "Fuzz", body: "Yangi xabar!" };
    try {
        if (event.data) payload = event.data.json();
    } catch { /* jim */ }

    const options = {
        body:    payload.body,
        icon:    "./image/logo.png",
        badge:   "./image/logo.png",
        vibrate: [100, 50, 100],
        data:    { url: payload.url || "./" }
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "./";
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
            .then((list) => {
                for (const client of list) {
                    if (client.url.includes(url) && "focus" in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) return clients.openWindow(url);
            })
    );
});


/* ==========================================================
   7. SYNC (background sync — kelajak uchun)
   ========================================================== */
self.addEventListener("sync", (event) => {
    if (event.tag === "fuzz-sync") {
        console.info("[SW] Background sync:", event.tag);
        // Kelajakda: offline buyurtmalarni serverga yuborish
    }
});