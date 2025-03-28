"use server";

interface PushSubscriptionData {
    endpoint: string;
    p256dh: string;
    auth: string;
}

export async function getSubscription(endpoint: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_URL}?q=${endpoint}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ endpoint }),
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

export async function saveSubscription(subscriptionData: PushSubscriptionData) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_URL}`, {
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
    // In a production environment, you would want to remove the subscription from the database
    // For example: await db.subscriptions.delete({ where: { ... } })
    return { success: true };
}
