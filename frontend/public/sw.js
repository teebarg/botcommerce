self.addEventListener("push", function (event) {
    console.log("🚀 ~ event:", event);
    console.log("🚀 ~ event:", Boolean(event.data));
    if (event.data) {
        const data = event.data.json();
        console.log("🚀 ~ event:", data);
        const options = {
            body: data.body,
            icon: data.icon || "/avatar_ai.png",
            badge: "/avatar_ai.png",
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: "2",
            },
        };

        self.registration.showNotification(data.title, options)
        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener('push', function (event) {
    event.waitUntil(
        self.registration.showNotification('Test Notification', {
            body: 'This is a simple test notification',
            icon: '/avatar_ai.png',
            badge: '/avatar_ai.png',
        })
    );
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
