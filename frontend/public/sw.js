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

    if (url.pathname.startsWith("/_next/image")) {
        event.respondWith(cacheImage(event.request));
        return;
    }

    if (
        url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/i) ||
        url.pathname.startsWith("/products/") ||
        url.href.includes("cdn") ||
        url.href.includes("supabase.co/storage")
    ) {
        event.respondWith(staleWhileRevalidateImage(event.request));
        return;
    }

    // ✅ Cache static assets (Next.js static files, CSS, JS)
    if (url.pathname.startsWith("/_next/static/")) {
        event.respondWith(staleWhileRevalidate(event.request));
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

self.addEventListener("push", function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: "/icon.png", // small icon
            image: data.imageUrl ?? "/promo-banner.webp",
            badge: data.imageUrl ?? "/icon.png", // monochrome badge (Android only)
            actions: [
                { action: "view", title: "View" },
                { action: "dismiss", title: "Dismiss" },
            ],
            vibrate: [200, 100, 200],
            data: {
                url: data.data.actionUrl || data.path || "/",
                dateOfArrival: Date.now(),
                primaryKey: "2",
                subscriberId: data.subscriberId,
                notificationId: data.notificationId,
            },
            requireInteraction: true,
        };

        fetch("/api/push-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subscriberId: data.subscriberId,
                eventType: "DELIVERED",
                platform: navigator.platform,
                deviceType: getDeviceType(),
                userAgent: navigator.userAgent,
                notificationId: data.notificationId,
                deliveredAt: new Date(),
            }),
        });

        event.waitUntil(
            self.registration
                .showNotification(data.title, options)
                .then(hasActiveClients)
                .then((activeClients) => {
                    if (!activeClients) {
                        self.numBadges += 1;
                        navigator.setAppBadge(self.numBadges);
                    }
                })
                .catch((err) => sendMessage(err))
        );
    }
});

self.addEventListener("notificationclick", (event) => {
    const data = event.notification.data;

    fetch("/api/push-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            subscriberId: data.subscriberId,
            eventType: event.action === "view" ? "OPENED" : "DISMISSED",
            platform: navigator.platform,
            deviceType: getDeviceType(),
            userAgent: navigator.userAgent,
            notificationId: data.notificationId,
            readAt: new Date(),
        }),
    });

    if (event.action == "view") {
        event.waitUntil(clients.openWindow(event.notification.data.url));
        event.notification.close();
        return;
    }

    if (event.action == "dismiss") {
        event.notification.close();
    }
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
