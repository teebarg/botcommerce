import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Gift, X } from "lucide-react";

import { Message } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/fetch-api";

const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    try {
        // Add padding to make length a multiple of 4
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

        // Decode the base64 string
        const rawData = window.atob(base64);

        // Convert binary string to Uint8Array
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    } catch (error) {
        throw new Error(`Error decoding Base64 string - ${error}`);
    }
}

function getStoredSubscriptionKeys() {
    const stored = localStorage.getItem("push_subscription_keys");
    return stored ? JSON.parse(stored) : null;
}

function hasSubscriptionChanged(currentSub: PushSubscription) {
    const stored = getStoredSubscriptionKeys();
    if (!stored) return true;

    const current = {
        endpoint: currentSub.endpoint,
        p256dh: currentSub.toJSON().keys?.p256dh || "",
        auth: currentSub.toJSON().keys?.auth || "",
    };

    return stored.endpoint !== current.endpoint || stored.p256dh !== current.p256dh || stored.auth !== current.auth;
}

function storeSubscriptionKeys(sub: PushSubscription) {
    const subscriptionData = {
        endpoint: sub.endpoint,
        p256dh: sub.toJSON().keys?.p256dh || "",
        auth: sub.toJSON().keys?.auth || "",
    };
    localStorage.setItem("push_subscription_keys", JSON.stringify(subscriptionData));
}

export default function PushPermission() {
    const [permission, setPermission] = useState("granted");
    const [subscription, setSubscription] = useState<PushSubscription | any | null>(null);
    const [isDismissed, setIsDismissed] = useState<boolean>(false);

    useEffect(() => {
        const dismissedAt = localStorage.getItem("push_dismissed_at");
        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt, 10);
            const now = Date.now();

            if (now - dismissedTime < DISMISS_DURATION) {
                setIsDismissed(true);
            } else {
                localStorage.removeItem("push_dismissed_at");
                setIsDismissed(false);
            }
        }

        if (localStorage.getItem("push_synced") === "true") {
            setIsDismissed(true);
        }

        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }

        if (permission === "granted" && localStorage.getItem("push_synced") !== "true") {
            setIsDismissed(true);
            registerServiceWorker();
        }
    }, [permission]);

    useEffect(() => {
        if (permission !== "granted") return;

        const checkSubscriptionChanges = async () => {
            try {
                const registration = await navigator.serviceWorker.ready;
                const sub = await registration.pushManager.getSubscription();

                if (sub && hasSubscriptionChanged(sub)) {
                    console.log("Subscription changed, syncing with backend...");
                    await syncSubscriptionToBackend(sub);
                }
            } catch (error) {
                console.error("Error checking subscription:", error);
            }
        };

        checkSubscriptionChanges();
        const intervalId = setInterval(checkSubscriptionChanges, CHECK_INTERVAL);

        return () => clearInterval(intervalId);
    }, [permission]);

    async function syncSubscriptionToBackend(sub: PushSubscription) {
        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const { error } = await tryCatch(api.post<Message>("/notification/push-fcm", subscriptionData));

        if (error) {
            toast.error(error);
            return false;
        }

        storeSubscriptionKeys(sub);
        setSubscription(sub);
        localStorage.setItem("push_synced", "true");
        return true;
    }

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();

        if (!sub) {
            setIsDismissed(false);
            return;
        }

        if (hasSubscriptionChanged(sub)) {
            await syncSubscriptionToBackend(sub);
        } else {
            setSubscription(sub);
        }
    }

    async function handleNotificationOptIn() {
        if (!("serviceWorker" in navigator)) throw new Error("SW not supported");
        if (!("PushManager" in window)) throw new Error("Push not supported");
        if (subscription) return;
        if (permission === "denied") {
            toast.error("You blocked notifications. Please re-enable in browser settings.", {
                duration: 5000,
            });
            return;
        }
        await subscribeToPush();
    }

    async function subscribeToPush() {
        const perm = await Notification.requestPermission();

        setPermission(perm);

        if (perm !== "granted") return null;
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            // @ts-ignore -- Suppress TS2322 for BufferSource mismatch
            applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY!),
        });

        if (!sub) {
            toast.error("You blocked notifications. Please re-enable in browser settings.", {
                duration: 5000,
            });
            return;
        }

        await syncSubscriptionToBackend(sub);
    }

    function handleDismiss() {
        setIsDismissed(true);
        localStorage.setItem("push_dismissed_at", Date.now().toString());
    }

    if (isDismissed || permission === "granted") return null;

    return (
        <div className="fixed bottom-8 left-4 right-4 z-50 animate-slide-up">
            <div className="relative flex items-center justify-between max-w-md mx-auto bg-linear-to-r from-blue-800 to-cyan-700 rounded-lg py-4 px-6">
                <div className="flex items-center space-x-3 flex-1">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-accent to-primary flex items-center justify-center animate-bounce">
                        <Gift className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-semibold text-sm">🎁 Unlock Your Gift!</p>
                        <p className="text-white/80 text-xs">Enable alerts to receive your offer</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        aria-label="Enable"
                        className="bg-white text-gray-800 hover:bg-white/90 h-10 mr-4"
                        size="sm"
                        onClick={handleNotificationOptIn}
                    >
                        OK
                    </Button>

                    <Button aria-label="Dismiss" size="icon" className="absolute top-2 right-2 w-auto h-auto" variant="ghost" onClick={handleDismiss}>
                        <X className="h-5 w-5 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
