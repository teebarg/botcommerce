const broadcast = new BroadcastChannel("sw-messages");
const CACHE_NAME = "shop-cache-v3";

const STATIC_PAGES = ["/about", "/careers", "/privacy", "/terms", "/returns", "/shipping", "/offline", "/favicon.ico"];

self.addEventListener("install", (event) => {
    console.log("[Service Worker] Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Pre-caching static pages...");
            return cache.addAll(STATIC_PAGES);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("[Service Worker] Activating...");
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((oldKey) => {
                        console.log(`[Service Worker] Removing old cache: ${oldKey}`);
                        return caches.delete(oldKey);
                    })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    if (
        url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/i) ||
        url.pathname.startsWith("/products/") ||
        url.href.includes("cdn") ||
        url.href.includes("supabase.co/storage")
    ) {
        event.respondWith(staleWhileRevalidateImage(event.request));
        return;
    }

    // ✅ Cache static pages
    if (STATIC_PAGES.includes(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    if (event.request.mode === "navigate") {
        event.respondWith(fetch(event.request).catch(() => caches.match("/offline")));
        return;
    }
});

self.addEventListener("push", (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch (err) {
        console.error("[SW] Failed to parse push payload:", err);
        return;
    }

    const options = {
        body: data.body,
        icon: "/icon.png",
        image: data.imageUrl ?? "/promo-banner.webp",
        badge: "/icon.png",
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
            { action: "view", title: "View" },
            { action: "dismiss", title: "Dismiss" },
        ],
        data: {
            url: data?.data?.actionUrl ?? data?.path ?? "/",
            subscriberId: data.subscriberId,
            notificationId: data.notificationId,
            receivedAt: Date.now(),
        },
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options).then(() => {
            return fetch("/api/push-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriberId: data.subscriberId,
                    notificationId: data.notificationId,
                    eventType: "DELIVERED",
                    deliveredAt: new Date().toISOString(),
                }),
            }).catch((err) => {
                console.warn("[SW] Failed to log delivered:", err);
            });
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    const info = event.notification.data;
    const action = event.action;

    const eventType = action === "view" ? "OPENED" : "DISMISSED";

    event.waitUntil(
        fetch("/api/push-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subscriberId: info.subscriberId,
                notificationId: info.notificationId,
                eventType,
                timestamp: new Date().toISOString(),
            }),
        }).catch((err) => {
            console.warn("[SW] Failed to report push event:", err);
        })
    );

    if (action === "view") {
        event.waitUntil(clients.openWindow(info.url));
        event.notification.close();
        return;
    }

    event.notification.close();
});

self.addEventListener("notificationclose", (event) => {
    const info = event.notification.data;

    event.waitUntil(
        fetch("/api/push-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subscriberId: info.subscriberId,
                notificationId: info.notificationId,
                eventType: "DISMISSED",
                timestamp: new Date().toISOString(),
            }),
        })
    );
});

self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") {
        console.log("skip waiting broadcast here....eeeee");
        self.skipWaiting();
    }
});

async function staleWhileRevalidateImage(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || networkFetch;
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const networkFetch = fetch(request)
        .then((response) => {
            cache.put(request, response.clone());
            return response;
        })
        .catch(() => cached);

    return cached || networkFetch;
}

async function cacheImage(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        trimImageCache(150);
        return networkResponse;
    } catch (err) {
        console.warn("[SW] Image fetch failed:", err);
        return caches.match("/fallback-image.png");
    }
}

async function trimImageCache(maxItems = 100) {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    if (keys.length > maxItems) {
        await cache.delete(keys[0]);
    }
}

function getDeviceType() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    if (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) {
        return "IOS";
    }

    if (/android/i.test(ua)) {
        return "ANDROID";
    }

    if (/Macintosh|Windows|Linux/.test(ua)) {
        return "DESKTOP";
    }

    return "WEB";
}
