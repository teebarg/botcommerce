/* eslint-disable no-restricted-globals */
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

const API_BASE = self.location.origin;
const OFFLINE_SHELL = "/";

precacheAndRoute(self.__WB_MANIFEST);

// We use a custom handler for navigation requests (page loads)
// const navigationHandler = async (params) => {
//     try {
//         return await new NetworkFirst({
//             cacheName: "pages-cache",
//         }).handle(params);
//     } catch (error) {
//         const fallback = await caches.match(OFFLINE_SHELL);
//         if (fallback) return fallback;

//         return Response.error();
//     }
// };

// Target TanStack Server Functions (Read-Only)
registerRoute(
    ({ url, request }) => {
        return url.pathname.startsWith("/_serverFn/") && request.method === "GET";
    },
    new NetworkFirst({
        cacheName: "ts-server-functions-cache",
        networkTimeoutSeconds: 5,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// This ensures POST requests always hit the network and never the cache
registerRoute(
    ({ url, request }) => url.pathname.startsWith("/_serverFn/") && request.method === "POST",
    new (class {
        async handle({ request }) {
            return fetch(request);
        }
    })()
);

// const navigationRoute = new NavigationRoute(navigationHandler, {
//     denylist: [
//         /^\/api/,
//         /^\/_serverFn/,
//         /\/[^\/]+\.[^\/]+$/, // Ignore files with extensions (images, etc.)
//     ],
// });

// registerRoute(navigationRoute);
cleanupOutdatedCaches();

// IMAGE CACHING
registerRoute(
    ({ request, url }) =>
        (request.destination === "image" || url.origin.includes("supabase.co") || url.href.includes("cdn")) &&
        request.destination !== "serviceworker",
    new StaleWhileRevalidate({
        cacheName: "image-cache",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 150,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
        ],
    })
);

// Handles offline fallback logic
registerRoute(
    ({ request, url }) => {
        const isNavigation = request.mode === "navigate";
        const isApiRequest = url.pathname.startsWith("/api/") || url.hostname === "api.revoque.com.ng" || url.hostname === "api.shop.localhost";

        return isNavigation || isApiRequest;
    },
    new NetworkFirst({
        cacheName: "api-nav-cache",
        networkTimeoutSeconds: 5,
        plugins: [
            {
                handlerDidError: async () => {
                    return Response.error();
                },
            },
        ],
    })
);

// PUSH NOTIFICATIONS
self.addEventListener("push", (event) => {
    if (!event.data) return;
    let data;
    try {
        data = event.data.json();
    } catch (err) {
        return;
    }

    const options = {
        body: data.body,
        icon: "/pr-logo.png",
        image: data.imageUrl ?? "/promo-banner.webp",
        badge: "/pr-logo.png",
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
        Promise.all([
            self.registration.showNotification(data.title, options),
            fetch(`${API_BASE}/api/push-event`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriberId: data.subscriberId,
                    notificationId: data.notificationId,
                    eventType: "DELIVERED",
                    deliveredAt: new Date().toISOString(),
                    timestamp: new Date().toISOString(),
                }),
            }).catch((err) => console.error("Failed to send push event:", err)),
        ])
    );
});

self.addEventListener("notificationclick", (event) => {
    const info = event.notification.data;
    const action = event.action;
    const eventType = action === "view" ? "OPENED" : "DISMISSED";

    event.waitUntil(
        fetch(`${API_BASE}/api/push-event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subscriberId: info.subscriberId,
                notificationId: info.notificationId,
                eventType,
                timestamp: new Date().toISOString(),
            }),
        }).catch(() => {})
    );

    if (action === "view") {
        event.waitUntil(self.clients.openWindow(info.url));
    }
    event.notification.close();
});

self.addEventListener("notificationclose", (event) => {
    const info = event.notification.data;
    if (!info) return;
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
        }).catch(() => {})
    );
});

// MESSAGING & LIFECYCLE
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
