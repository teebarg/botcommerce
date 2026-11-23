/* eslint-disable no-restricted-globals */
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

const API_BASE = self.location.origin;
const OFFLINE_SHELL = "/";

const API_ORIGIN = (() => {
    try {
        return new URL(import.meta.env.VITE_API_URL).origin;
    } catch {
        return null;
    }
})();

// Only public catalog data may be cached by the service worker.
const PUBLIC_API = /^\/(api\/)?(category|collection|faq|album|product)(\/|$)/;
const PRIVATE_API = /\/(recommend|review-status)(\/|$)/;

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({ request, url }) => request.destination === "script" && (url.pathname.includes(".lazy-") || url.pathname.includes("/assets/")),
    new StaleWhileRevalidate({ cacheName: "route-chunks" })
);

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
            new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 10 * 60 }),
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

cleanupOutdatedCaches();

// IMAGE CACHING
registerRoute(
    ({ request, url }) =>
        (request.destination === "image" || url.origin.includes("supabase.co") || url.href.includes("cdn")) &&
        request.destination !== "serviceworker",
    new StaleWhileRevalidate({
        cacheName: "image-cache",
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 300,
                maxAgeSeconds: 30 * 24 * 60 * 60,
            }),
        ],
    })
);

// Page navigations
registerRoute(
    ({ request }) => request.mode === "navigate",
    new NetworkFirst({
        cacheName: "pages-cache",
        networkTimeoutSeconds: 5,
        plugins: [
            new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 }),
            {
                handlerDidError: async () => {
                    return Response.error();
                },
            },
        ],
    })
);

// Public catalog API: short network timeout (slow mobile networks shouldn't wait 5s), cached copy as fallback.
registerRoute(
    ({ request, url }) => {
        if (request.method !== "GET") return false;
        const isApi = url.pathname.startsWith("/api/") || (API_ORIGIN !== null && url.origin === API_ORIGIN);
        return isApi && PUBLIC_API.test(url.pathname) && !PRIVATE_API.test(url.pathname);
    },
    new NetworkFirst({
        cacheName: "api-public-cache",
        networkTimeoutSeconds: 3,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }),
        ],
    })
);

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
        tag: data.tag || "general-alert",
        renotify: true,
        actions: [
            { action: "view", title: "View" },
            { action: "dismiss", title: "Dismiss" },
        ],
        data: {
            url: data?.data?.actionUrl ?? data?.path ?? "/",
            title: data.title,
            body: data.body,
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
                    event: "push_message_delivered",
                }),
            }).catch((err) => console.error("Failed to send push event:", err)),
        ])
    );
});

self.addEventListener("notificationclick", (event) => {
    const info = event.notification.data;
    const action = event.action;
    const eventType = action === "view" ? "push_message_opened" : "push_message_dismissed";

    event.waitUntil(
        fetch(`${API_BASE}/api/push-event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: eventType,
            }),
        }).catch(() => { })
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
        fetch(`${API_BASE}/api/push-event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: "push_message_clicked",
            }),
        }).catch(() => { })
    );
});

// MESSAGING & LIFECYCLE
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
    if (event.data && event.data.type === "CLEAR_USER_CACHES") {
        event.waitUntil(Promise.all(["pages-cache", "ts-server-functions-cache"].map((name) => caches.delete(name))));
    }
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
