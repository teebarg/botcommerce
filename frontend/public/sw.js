const broadcast = new BroadcastChannel("sw-messages");
const CACHE_NAME = "botcommerce-cache-v1";
const ASSETS_TO_CACHE = [
    // "/", // Root URL
    "/careers",
    "/about",
    "/privacy",
    "/terms",
    "/returns",
    "/shipping",
    "/avatar_ai.png",
    "/bot.svg",
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
    // event.respondWith(
    //     caches.match(event.request).then((cachedResponse) => {
    //         return (
    //             cachedResponse ||
    //             fetch(event.request).catch(() => {
    //                 if (event.request.mode === "navigate") {
    //                     return caches.match("/offline"); // Serve the offline page
    //                 }
    //             })
    //         );
    //     })
    // );
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

// self.addEventListener("notificationclick", (event) => {
//     // event.notification.close();
//     const targetUrl = event.notification.data.url;
//     event.waitUntil(
//         clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
//             for (const client of clientList) {
//                 if (client.url === targetUrl && "focus" in client) return client.focus();
//             }
//             if (clients.openWindow) return clients.openWindow(targetUrl);
//         })
//     );
// });

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
});

self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") {
        console.log("skip waiting broadcast here....eeeee");
        self.skipWaiting();
    }
});

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
