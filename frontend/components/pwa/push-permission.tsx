"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Gift, X } from "lucide-react";

import { api } from "@/apis/client";
import { Message } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import { Button } from "@/components/ui/button";

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

export default function PushPermission() {
    const [permission, setPermission] = useState("granted");
    const [subscription, setSubscription] = useState<PushSubscription | any | null>(null);
    const [isDismissed, setIsDismissed] = useState<boolean>(false);

    useEffect(() => {
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

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();

        if (!sub) {
            setIsDismissed(false);

            return;
        }

        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const { error } = await tryCatch(api.post<Message>("/notification/push-fcm", subscriptionData));

        if (error) {
            toast.error(error);

            return;
        }

        setSubscription(sub);
        localStorage.setItem("push_synced", "true");
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
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });

        if (!sub) {
            toast.error("You blocked notifications. Please re-enable in browser settings.", {
                duration: 5000,
            });

            return;
        }

        const subscriptionData = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys?.p256dh || "",
            auth: sub.toJSON().keys?.auth || "",
        };

        const { error } = await tryCatch(api.post<Message>("/notification/push-fcm", subscriptionData));

        if (error) {
            toast.error(error);

            return;
        }

        setSubscription(sub);
        localStorage.setItem("push_synced", "true");
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

                    <Button
                        aria-label="Dismiss"
                        size="icon"
                        className="absolute top-2 right-2 w-auto h-auto"
                        variant="ghost"
                        onClick={() => setIsDismissed(true)}
                    >
                        <X className="h-5 w-5 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
