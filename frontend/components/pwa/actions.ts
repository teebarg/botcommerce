"use server";

import webpush from "web-push";

webpush.setVapidDetails("mailto:<teebarg01@gmail.com>", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);

let subscription: PushSubscription | null = null;

interface PushSubscriptionData {
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string;
        auth: string;
    };
}

async function saveSubscription(subscriptionData: PushSubscriptionData) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_URL}/api/v1/notifications/subscribe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...subscriptionData, group: "bot" }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const responseData = await response.json();
        console.log("Subscription saved successfully:", responseData);
        return { success: true };
    } catch (error: any) {
        console.error("Error saving subscription:", error);
        return { success: false, message: error.message };
    }
}

export async function subscribeUser(sub: PushSubscription) {
    console.log("sub", sub);
    subscription = sub;

    return saveSubscription(sub as unknown as PushSubscriptionData);
}

export async function unsubscribeUser() {
    subscription = null;

    // In a production environment, you would want to remove the subscription from the database
    // For example: await db.subscriptions.delete({ where: { ... } })
    return { success: true };
}

export async function sendNotification(message: string) {
    if (!subscription) {
        throw new Error("No subscription available");
    }

    try {
        await webpush.sendNotification(
            subscription as unknown as webpush.PushSubscription,
            JSON.stringify({
                title: "Test Notification",
                body: message,
                icon: "/icon.png",
            })
        );

        return { success: true };
    } catch (error) {
        console.error("Error sending push notification:", error);

        return { success: false, error: "Failed to send notification" };
    }
}
