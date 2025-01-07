const broadcast = new BroadcastChannel("sw-messages");
const CACHE_NAME = "botmerce-cache-v1"; // Increment this value for new versions
const ASSETS_TO_CACHE = [
    "/", // Root URL
    "/career-opportunities",
    "/claim",
    "/latest-news",
    "/our-story",
    "/privacy",
    "/support",
    "/terms",
    "/user-agreement",
    "/globals.css",
    "/avatar_ai.png",
    "/bot.svg",
    "/empty-cart.png",
    "/frontend.webp",
    "/side-banner.webp",
    "/offline", // A fallback page for offline users
    "/favicon.ico", // Favicon
    // "/_next/static/", // Next.js static files
];

// Install event: Cache static assets
self.addEventListener("install", (event) => {
    console.log("Service Worker installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Caching assets...");

            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Skip waiting and activate the new service worker immediately
    // broadcast.postMessage({ type: "NEW_CONTENT_AVAILABLE" });
});

// Activate event: Cleanup old caches
self.addEventListener("activate", (event) => {
    console.log("Service Worker activating...");
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("[Service Worker] Deleting old cache:", cache);

                        return caches.delete(cache);
                    }
                })
            )
        )
    );
});

// Fetch event: Cache dynamic URLs
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Check if the request is for the `_next/image` endpoint
    if (url.pathname === "/_next/image") {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return (
                    cachedResponse ||
                    fetch(event.request).then((networkResponse) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    })
                );
            })
        );
        return;
    }

    // Default caching strategy for other requests
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return (
                cachedResponse ||
                fetch(event.request).catch(() => {
                    if (event.request.mode === "navigate") {
                        return caches.match("/offline"); // Serve the offline page
                    }
                })
            );
        })
    );
});

self.addEventListener("push", function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: "/icon.png",
            image: "/promo-banner.webp",
            badge: "/icon.png",
            actions: [
                { action: "view", title: "View" },
                { action: "dismiss", title: "Dismiss" },
            ],
            vibrate: [200, 100, 200],
            data: {
                url: data.path || "/", // Navigate to this URL
                dateOfArrival: Date.now(),
                primaryKey: "2",
            },
        };

        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener("notificationclick", function (event) {
    if (event.action == "view") {
        event.waitUntil(clients.openWindow(event.notification.data.url));
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
