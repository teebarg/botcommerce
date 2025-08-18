"use server";

interface PushSubscriptionData {
    endpoint: string;
    p256dh: string;
    auth: string;
}

export async function saveSubscription(subscriptionData: PushSubscriptionData) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_URL}/api/subscription`, {
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

        return { success: true, message: "Success", data: responseData };
    } catch (error: any) {
        return { success: false, message: error.message, data: null };
    }
}

export async function syncSubscription(subscriptionData: PushSubscriptionData) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_URL}/api/subscription/sync`, {
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

        return { success: true, message: "Success", data: responseData };
    } catch (error: any) {
        return { success: false, message: error.message, data: null };
    }
}

export async function unsubscribeUser() {
    // TODO: unsubscribe
    return { success: true };
}
