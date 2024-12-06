self.addEventListener("push", function (event) {
    console.log("🚀 ~ event:", event);
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || "/icon.png",
            badge: "/badge.png",
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: "2",
            },
        };

        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener("notificationclick", function (event) {
    console.log("Notification click received.");
    event.notification.close();
    event.waitUntil(clients.openWindow("<https://your-website.com>"));
});

self.addEventListener("install", (event) => {
    console.log("Service Worker installing.");
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activating.");
});

self.addEventListener("fetch", (event) => {
    console.log("Fetching:", event.request.url);
    event.respondWith(fetch(event.request));
});
